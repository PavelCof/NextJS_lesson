import { Cat } from "@/app/lib/definitions";
import pool from "./database";
import { QueryResult } from "pg";
import { formatCurrency } from "@/app/lib/utils";

export async function getAllCats(): Promise<Cat[]> {
    try {
   
        const result: QueryResult<Cat> = await pool.query('SELECT * FROM cats');
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
export async function fetchCardData() {
    try {
      // You can probably combine these into a single SQL query
      // However, we are intentionally splitting them to demonstrate
      // how to initialize multiple queries in parallel with JS.
      const invoiceCountPromise = await pool.query(`SELECT COUNT(*) FROM cats`);
      const customerCountPromise = await pool.query(`SELECT COUNT(*) FROM cats`);
      const invoiceStatusPromise = await pool.query(`SELECT COUNT(*) FROM cats`);
        //    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        //    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      const data = await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        invoiceStatusPromise,
      ]);
  
      const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
      const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
      const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
      const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
  
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }

  export async function fetchLatestInvoices() {
    try {
      const data = await pool.query(`
        SELECT * FROM cats  LIMIT 5`);
        // invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        // FROM cats
        // JOIN customers ON invoices.customer_id = customers.id
        // ORDER BY invoices.date DESC
      const latestInvoices = data.rows.map((invoice) => ({
        ...invoice,
        amount: formatCurrency(invoice.amount),
      }));
      return latestInvoices;
    } catch (error) {
      console.error('Database Error:', error);
      throw error;
    }
  }
// export async function fetchCats() {
//     try {
//         const catsData: Cat[] = await getAllCats();
//         return catsData;
//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// }




