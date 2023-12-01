import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Webtoon } from "./webtoon.model";
import { Genre } from "./genre.model";

@Table({
    tableName: "genrewebtoon"
})
export class GenreWebtoon extends Model {

    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    id: number;
    
    @ForeignKey(() => Genre)
    @Column
    genreId: number;

    @ForeignKey(() => Webtoon)
    @Column
    webtoonId: string;

}