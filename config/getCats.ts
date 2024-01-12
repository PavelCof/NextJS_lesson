import { Cat } from "@/app/lib/definitions";
import pool from "./database";
import { QueryResult } from "pg";

export async function getAllCats(): Promise<Cat[]> {
    try {
        const result: QueryResult<Cat> = await pool.query('SELECT * FROM cats');
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function fetchCats(): Promise<Cat[]> {
    try {
        const catsData = await getAllCats();
        return catsData;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function exampleUsage() {
    try {
        const cats: Cat[] = await fetchCats();
        console.log(cats);
        return cats; // Добавляем возврат для правильной обработки промиса
    } catch (error) {
        console.error(error);
        throw error;
    }
}



