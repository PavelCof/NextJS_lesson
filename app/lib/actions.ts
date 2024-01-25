'use server';
import { z } from 'zod';
import pool from "@/config/database";
import { QueryResult } from "pg";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.string(),//z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // Test it out:
    // console.log(rawFormData);

    await pool.query(`
        INSERT INTO cats (id,customer_id, amount, status, date)
        VALUES (DEFAULT,${customerId}, ${amountInCents}, ${status}, ${date})
    `)
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    const amountInCents = amount * 100;
   
    await  pool.query(`
      UPDATE cats
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `);
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    await pool.query(`DELETE FROM cats WHERE id = ${id}`);
    revalidatePath('/dashboard/invoices');
  }