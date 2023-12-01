import { Column, Model, Table, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import { UserWebtoon } from './userWebtoon.model';
import { Webtoon } from './webtoon.model';
import { Comment } from './comments.model';

@Table({
    tableName: "users",
})
export class User extends Model {

    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true})
    email: string;

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

    @HasMany(() => Comment)
    comments: Comment[];

    @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
    currentRefreshToken?: string;

    @Column({ type: DataType.DATE, allowNull: true, defaultValue: null })
    currentRefreshTokenExp?: Date;
}