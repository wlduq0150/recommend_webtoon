import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { Webtoon } from "./webtoon.model";

@Table({
    tableName: "comments"
})
export class Comment extends Model {

    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    content: string;
    
    @ForeignKey(() => User)
    @Column
    userId: number;

    @ForeignKey(() => Webtoon)
    @Column
    webtoonId: string;

}