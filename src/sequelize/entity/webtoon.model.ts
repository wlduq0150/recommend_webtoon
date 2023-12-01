import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { UserWebtoon } from "./userWebtoon.model";
import { Genre } from "./genre.model";
import { GenreWebtoon } from "./genreWebtoon.model";
import { Comment } from "./comments.model";


@Table({
    tableName: "webtoons"
})
export class Webtoon extends Model {

    @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false})
    title: string;

    @Column({ type: DataType.STRING, allowNull: false})
    author: string;
    
    @Column({ type: DataType.INTEGER, allowNull: false })
    episodeLength: number;

    @Column({ type: DataType.STRING, allowNull: true})
    thumbnail: string;

    @Column({ type: DataType.STRING, allowNull: true})
    service: string;

    @Column({ type: DataType.STRING, allowNull: true})
    updateDay: string;

    @Column({ type: DataType.STRING, allowNull: true})
    category: string;
    
    @Column({ type: DataType.STRING, allowNull: true})
    genres: string;

    @Column({ type: DataType.INTEGER, allowNull: true})
    genreCount: number;

    @Column({ type: DataType.TEXT, allowNull: true})
    description: string;

    @Column({ type: DataType.INTEGER, allowNull: true})
    fanCount: number;

    @Column({ type: DataType.TEXT , allowNull: true})
    embVector: string;

    @HasMany(() => Comment)
    comments: Comment[];

    @BelongsToMany(() => User, () => UserWebtoon)
    users: User[];

    @BelongsToMany(() => Genre, () => GenreWebtoon)
    genres_: Genre[];
}