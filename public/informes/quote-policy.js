// Fechas de emisión y vencimiento en el calendario de Ciudad de México.
(function (root) {
  const DAYS = 15;
  const TERMS = 'La cotización no reserva la fecha del evento. El precio del paquete acordado queda garantizado al firmar el contrato y cubrir el anticipo de $3,000. Los cambios posteriores en invitados, paquete o servicios se cotizan por separado.';
  function validity(now = new Date()) {
    const issued = now.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const until = new Date(issued + 'T12:00:00Z');
    until.setUTCDate(until.getUTCDate() + DAYS);
    const format = date => date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return { issued, expires: until.toISOString().slice(0, 10), issuedLabel: format(new Date(issued + 'T12:00:00Z')), expiresLabel: format(until) };
  }
  root.VVQuotePolicy = Object.freeze({ days: DAYS, terms: TERMS, validity });
})(window);
