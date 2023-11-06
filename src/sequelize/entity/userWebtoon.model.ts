import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { Webtoon } from "./webtoon.model";

@Table({
    tableName: "userwebtoon"
})
export class UserWebtoon extends Model {
    @ForeignKey(() => User)
    // @BelongsTo(() => User)
    @Column
    user_id: number;

    @ForeignKey(() => Webtoon)
    // @BelongsTo(() => Webtoon)
    @Column
    webtoon_id: number;

}