import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const API_KEY = process.env.CRM_API_KEY || process.env.DASH_PASSWORD;

interface Payment {
  event_code: string;
  name: string;
  amount: number;
  due_date: string;
  paid: boolean;
  note: string | null;
}

interface Event {
  code: string;
  name: string;
  type: string;
  date: string;
  phone: string | null;
}

interface PaymentReminder {
  event_name: string;
  event_code: string;
  phone: string | null;
  payment_name: string;
  amount: string;
  due_date: string;
  days_until_due: number;
  status: "overdue" | "due_soon";
  whatsapp_url: string;
}

function formatPesos(amount: number): string {
  return (
    "$" +
    amount.toLocaleString("es-MX", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatDateMX(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysDiff(dueDateStr: string, now: Date): number {
  const due = new Date(dueDateStr + "T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildWhatsAppURL(
  phone: string | null,
  eventName: string,
  paymentName: string,
  amount: string,
  dueDate: string,
  daysUntilDue: number
): string {
  let urgency: string;
  if (daysUntilDue < 0) {
    urgency = `⚠️ Este pago tiene ${Math.abs(daysUntilDue)} día(s) de atraso.`;
  } else if (daysUntilDue === 0) {
    urgency = "⚠️ Este pago vence HOY.";
  } else {
    urgency = `📅 Este pago vence en ${daysUntilDue} día(s).`;
  }

  const message = [
    `Hola! 👋 Te enviamos un recordatorio de pago de Salón de Fiestas Villaverde.`,
    ``,
    `🎉 *Evento:* ${eventName}`,
    `💳 *Concepto:* ${paymentName}`,
    `💰 *Monto:* ${amount}`,
    `📆 *Fecha límite:* ${dueDate}`,
    ``,
    urgency,
    ``,
    `Si ya realizaste tu pago, envíanos el comprobante. ¡Gracias! 🙏`,
  ].join("\n");

  const phoneNum = phone ? `521${phone.replace(/\D/g, "")}` : "";
  return `https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`;
}

async function supabaseFetch<T>(
  table: string,
  query: string
): Promise<T[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${query}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${table}): ${res.status} - ${text}`);
  }

  return res.json();
}

export async function GET(request: NextRequest) {
  // Accept Vercel cron header or API key
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const key = request.nextUrl.searchParams.get("key");
  if (!isVercelCron && key !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
    );

    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split("T")[0];

    const payments = await supabaseFetch<Payment>(
      "eventus_payments",
      `paid=eq.false&due_date=lte.${threeDaysStr}&select=*`
    );

    if (payments.length === 0) {
      return NextResponse.json({
        message: "No hay recordatorios pendientes",
        reminders: [],
        checked_at: now.toISOString(),
      });
    }

    const eventCodes = [...new Set(payments.map((p) => p.event_code))];

    const events = await supabaseFetch<Event>(
      "eventus_events",
      `code=in.(${eventCodes.map((c) => `"${c}"`).join(",")})&select=*`
    );

    const eventMap = new Map(events.map((e) => [e.code, e]));

    const reminders: PaymentReminder[] = payments.map((payment) => {
      const event = eventMap.get(payment.event_code);
      const eventName = event?.name ?? payment.event_code;
      const phone = event?.phone ?? null;
      const amount = formatPesos(payment.amount);
      const dueFormatted = formatDateMX(payment.due_date);
      const daysUntil = daysDiff(payment.due_date, now);

      return {
        event_name: eventName,
        event_code: payment.event_code,
        phone,
        payment_name: payment.name,
        amount,
        due_date: dueFormatted,
        days_until_due: daysUntil,
        status: daysUntil < 0 ? "overdue" : "due_soon",
        whatsapp_url: buildWhatsAppURL(
          phone,
          eventName,
          payment.name,
          amount,
          dueFormatted,
          daysUntil
        ),
      };
    });

    reminders.sort((a, b) => a.days_until_due - b.days_until_due);

    return NextResponse.json({
      message: `${reminders.length} recordatorio(s) de pago`,
      overdue_count: reminders.filter((r) => r.status === "overdue").length,
      due_soon_count: reminders.filter((r) => r.status === "due_soon").length,
      reminders,
      checked_at: now.toISOString(),
    });
  } catch (error) {
    console.error("Payment reminders error:", error);
    return NextResponse.json(
      {
        error: "Error al obtener recordatorios",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
