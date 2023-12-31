import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { Webtoon } from "./webtoon.model";
import { GenreWebtoon } from "./genreWebtoon.model";

@Table({
    tableName: "genres",
})
export class Genre extends Model {

    @Column({ type: DataType.STRING, allowNull: false, unique: true})
    keyword: string;

    @Column({ type: DataType.STRING, allowNull: false})
    service: string;

    @Column({ type: DataType.TEXT, allowNull: false})
    description: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    embVector: string;

    @Column({ type: DataType.STRING, allowNull: true })
    transformed: string;

    @BelongsToMany(() => Webtoon, () => GenreWebtoon)
    webtoons: Webtoon[];
    
}