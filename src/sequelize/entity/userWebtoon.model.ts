import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { Webtoon } from "./webtoon.model";

@Table({
    tableName: "userwebtoon"
})
export class UserWebtoon extends Model {

    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    id: number;
    
    @ForeignKey(() => User)
    @Column
    userId: number;

    @ForeignKey(() => Webtoon)
    @Column
    webtoonId: string;

}