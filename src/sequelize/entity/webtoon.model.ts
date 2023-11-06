import { BelongsToMany, Column, DataType, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";
import { UserWebtoon } from "./userWebtoon.model";


@Table({
    tableName: "webtoon"
})
export class Webtoon extends Model {
    @Column({ type: DataType.STRING, allowNull: false, unique: true})
    webtoonId: string;

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

    @BelongsToMany(() => User, () => UserWebtoon)
    users: User[];

    @Column({ type: DataType.TEXT , allowNull: true})
    embVector: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    embVectorDescription: string;
}