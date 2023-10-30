import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CreateRecommendWebtoonDto, InitRecommendGenreOptionDto } from 'src/dto/recommend.dto';
import { GenreService } from 'src/genre/genre.service';
import { OpenaiService } from 'src/openai/openai.service';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { UserService } from 'src/user/user.service';
import { WebtoonService } from 'src/webtoon/webtoon.service';

@Injectable()
export class RecommendService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, 
        private readonly configService: ConfigService,
        private readonly openaiService: OpenaiService,
        private readonly userService: UserService,
        private readonly webtoonService: WebtoonService,
        private readonly genreService: GenreService,
    ) {}

    async createRecommendGenreText(webtoonId: string): Promise<string> {
        // 웹툰 데이터 불러오기
        const webtoon = await this.webtoonService.getWebtoonForId(webtoonId);
        const description = webtoon.description.replaceAll(/[\*\+#=\n]/g, "");

        // completion prompt 메세지 
        const messages = this.openaiService.create_3_5_PromptMessage(
            `너는 웹툰의 제목과 카테고리, 줄거리를 읽고 장르의 뜻과 연관 지어서 분석 후 줄거리의 뜻에 맞는 장르키워드를 알려주는 조수야`,
            `제목: ${webtoon.title}\n\n카테고리: ${webtoon.category}\n\n줄거리: ${description}\n\n\n\n위 제목과 줄거리를 가진 웹툰의 장르 키워드를 가장 적합한 순서대로 알려줘`
        );

        // 장르 분석 요청
        const result = await this.openaiService.create_3_5_Completion(
            this.configService.get<string>("OPENAI_WEBTOON_GENRE_MODEL"),
            messages,
            0.6,
            80
        );

        return result;
    }

    async createRecommendGenre(webtoonId: string): Promise<string[]> {
        const genreCounter: { [genre: string]: number } = {};

        // 5번의 추천으로 각 키워드 마다 빈도 수 세기
        for (let i=0; i<7; i++) {
            const genreText = await this.createRecommendGenreText(webtoonId);
            const genres = genreText.split(" ");

            genres.forEach((genre) => {
                if (genre in genreCounter) genreCounter[genre] += 1;
                else genreCounter[genre] = 1;
            });
        }

        // 가장 빈도 수가 높은 7개의 키워드만 추출
        const genreCounterArray: [string, number][] = Object.entries(genreCounter);
        genreCounterArray.sort(
            (a: [string, number], b: [string, number]) => b[1] - a[1],
        );
        const recommendGenres = 
        genreCounterArray
        .filter((genreCounterElement) => {
            return genreCounterElement[1] > 2;
        })
        .map((genreCounterElement) => {
            return genreCounterElement[0];
        });
        
        return recommendGenres;
    }

    async initWebtoonRecommendGenre(initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        // 조건에 맞는 웹툰 불러오기
        const webtoons = await this.webtoonService.getAllWebtoonForOption({
            ...initRecommendGenreOptionDto,
        });

        for (let webtoon of webtoons) {
            const { webtoonId } = webtoon;
            let genres: string[] = JSON.parse(webtoon.genres);
            // 최종적으로 기존의 순서를 유지하기 배열을 뒤집는다. 
            genres = genres.reverse();

            // 웹툰 장르를 gpt에게 요청해서 받아오기
            let recommendGenres = await this.createRecommendGenre(webtoonId);

            // 추천 받은 장르가 원래 장르에 이미 포함되어 있다면 순서를 앞으로 조정
            for (let [genre, idx] of genres) {
                const r_idx = recommendGenres.indexOf(genre);
                if (r_idx !== -1) {
                    recommendGenres.splice(r_idx, 1);
                    recommendGenres.unshift(genre);
                    genres[idx] = "delete";
                }
            }

            // 추천 받은 장르 중 기존에 이미 포함되어 있던 키워드는 삭제
            genres = genres.filter((genre) => { return genre !== "delete" });
            recommendGenres = [...genres, ...recommendGenres, "추천"];

            console.log(
                `제목: ${webtoon.title}\n줄거리: ${webtoon.description}\n기존 장르: ${webtoon.genres}\n추천 장르: ${recommendGenres}`,
            );

            await this.webtoonService.updateWebtoonForOption({
                webtoonId,
                genres: JSON.stringify(recommendGenres),
                genreCount: recommendGenres.length
            });
        }
    }

    async initWebtoonGenreEMB(initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        // 조건에 맞는 웹툰 불러오기
        const webtoons = await this.webtoonService.getAllWebtoonForOption({
            ...initRecommendGenreOptionDto,
        });

        for (let webtoon of webtoons) {

            const genres = JSON.parse(webtoon.genres);
            
            let genreText = "";

            // 모든 장르에 대해 장르의 뜻을 문자열로 합치기
            for (let genre of genres) {
                const genre_ = await this.genreService.getGenre({ keyword: genre });
                if (genre_) {
                    const description = genre_.description;
                    genreText += ( description || "" ) + "\n\n";
                }
            }

            // 장르 임베딩 벡터를 생성후 문자열로 변환
            const embVector = JSON.stringify(await this.openaiService.createEmbedding(genreText));

            // DB업데이트
            await this.webtoonService.updateWebtoonForOption({
                webtoonId: webtoon.webtoonId,
                embVector,
            });
        }
    }

    async initWebtoonDescriptionEMB(initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        // 조건에 맞는 웹툰 불러오기
        const webtoons = await this.webtoonService.getAllWebtoonForOption({
            ...initRecommendGenreOptionDto,
        });

        for (let webtoon of webtoons) {

            const { webtoonId, description } = webtoon;

            // 줄거리 임베딩 벡터를 생성후 문자열로 변환
            const embVectorDescription = JSON.stringify(await this.openaiService.createEmbedding(description));

            // DB업데이트
            await this.webtoonService.updateWebtoonForOption({
                webtoonId,
                embVectorDescription,
            });
        }
    }

    async createRecommendWebtoon(createRecommendWebtoonDto: CreateRecommendWebtoonDto): Promise<string[]> {
        const { category, genres } = createRecommendWebtoonDto;
        
        let genreText = "";

        // 모든 장르에 대해 장르의 뜻을 문자열로 합치기
        for (let genre of genres) {
            const genre_ = await this.genreService.getGenre({ keyword: genre });
            if (genre_) {
                const description = genre_.description;
                genreText += ( description || "" ) + "\n\n";
            }
        }

        // 장르 임베딩 벡터를 생성후 문자열로 변환
        const InputEmbVector = await this.openaiService.createEmbedding(genreText);

        // 카테고리에 해당하는 웹툰 전부 불러오기
        const webtoons = await this.webtoonService.getAllWebtoonForOption({ category });

        // { id: 유사도 }의 형태의 객체 리터럴
        const similarityComapre: { [id: string]: number } = {};

        for (let webtoon of webtoons) {
            if (webtoon.embVector) {
                similarityComapre[webtoon.webtoonId] =
                    await this.openaiService.calcSimilarityFromEmbedding(
                        InputEmbVector,
                        JSON.parse(webtoon.embVector),
                    );
            }
        }

        // similarityComapre를 통해 요청된 장르와 웹툰들 장르의 유사도를 비교하며 정렬
        webtoons.sort((a, b) => {
            return similarityComapre[b.webtoonId] - similarityComapre[a.webtoonId];
        });
        
        // 웹툰의 id를 반환 (응답 시간 단축)
        return webtoons.map((webtoon) => webtoon.webtoonId);
    }
}
