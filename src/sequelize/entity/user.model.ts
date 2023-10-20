import { Column, Model, Table, DataType, BelongsToMany } from 'sequelize-typescript';
import { UserWebtoon } from './userWebtoon.model';
import { Webtoon } from './webtoon.model';

@Table({
    tableName: "User",
})
export class User extends Model {
    @Column({ type: DataType.STRING, allowNull: false, unique: true})
    userId: string;

    @Column({ type: DataType.STRING, allowNull: false})
    password: string;

    @Column({ type: DataType.STRING, allowNull: false})
    name: string;

    @Column({ type: DataType.INTEGER, allowNull: false})
    age: number;

    @Column({ type: DataType.STRING, allowNull: false})
    sex: string;

    @Column({ type: DataType.STRING, allowNull: false})
    address: string;

    @BelongsToMany(() => Webtoon, () => UserWebtoon)
    readWebtoons: Webtoon[];

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
    currentRefreshToken?: string;

    @Column({ type: DataType.DATE, allowNull: true, defaultValue: null })
    currentRefreshTokenExp?: Date;
}