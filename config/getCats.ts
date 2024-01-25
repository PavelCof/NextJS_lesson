import { Cat } from "@/app/lib/definitions";
import pool from "./database";
import { QueryResult } from "pg";
import { formatCurrency } from "@/app/lib/utils";
import { unstable_noStore as noStore } from 'next/cache';
import CardWrapper from '@/app/ui/dashboard/cards';

export async function getAllCats(): Promise<Cat[]> {
  noStore();
    try {
 
      // await new Promise((resolve) => setTimeout(resolve, 3000));

        const result: QueryResult<Cat> = await pool.query('SELECT * FROM cats');
        
    
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
export async function fetchCardData() {
    noStore();
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

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
    noStore();
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




const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // const invoices = await sql<InvoicesTable>`
    //   SELECT
    //     invoices.id,
    //     invoices.amount,
    //     invoices.date,
    //     invoices.status,
    //     customers.name,
    //     customers.email,
    //     customers.image_url
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   WHERE
    //     customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`} OR
    //     invoices.amount::text ILIKE ${`%${query}%`} OR
    //     invoices.date::text ILIKE ${`%${query}%`} OR
    //     invoices.status ILIKE ${`%${query}%`}
    //   ORDER BY invoices.date DESC
    //   LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    // `;
    const invoices = await pool.query('SELECT * FROM cats WHERE name ILIKE $1 LIMIT 5', [`%${query}%`]);
    console.log(invoices);
    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    // throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM cats WHERE name ILIKE $1 LIMIT 5', [`%${query}%`]);
  //   const count = await sql`SELECT COUNT(*)
  //   FROM invoices
  //   JOIN customers ON invoices.customer_id = customers.id
  //   WHERE
  //     customers.name ILIKE ${`%${query}%`} OR
  //     customers.email ILIKE ${`%${query}%`} OR
  //     invoices.amount::text ILIKE ${`%${query}%`} OR
  //     invoices.date::text ILIKE ${`%${query}%`} OR
  //     invoices.status ILIKE ${`%${query}%`}
  // `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await pool.query(`
      SELECT
        id,
        name,customer_id
      FROM cats
      ORDER BY name ASC
    `);

    const customers = data.rows;

    console.log(customers);
    
    return customers;
  } catch (err) {
    console.error('Database Error:', err);

  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await await pool.query(`
      SELECT
        id,
        customer_id,
        amount,
        status
      FROM cats
      WHERE id = ${id};
    `);

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
  
  }
}