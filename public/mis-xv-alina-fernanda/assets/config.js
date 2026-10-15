/* Datos confirmados de esta invitación. No reutilizar contactos de otros eventos. */
window.ALINA_EVENT = Object.freeze({
  name: 'Alina Fernanda',
  ceremonyDate: '2026-11-28T15:45:00-06:00',
  receptionDate: '2026-11-28T18:00:00-06:00',
  invitationURL: 'https://www.salondefiestasvillaverde.com/mis-xv-alina-fernanda',
  reception: Object.freeze({
    name: 'Salón Villaverde',
    address: 'Carretera México-Cuautla Km 35.5, Santa Cruz Amalinalco, C.P. 56609, Chalco, Estado de México',
    map: 'https://maps.app.goo.gl/WiNBbqdBas4L6RDt6',
  }),
  // Pendiente del número que recibirá las confirmaciones (52 + 10 dígitos).
  rsvpPhone: null,
  // Archivo de audio entregado por el usuario para esta invitación.
  music: Object.freeze({ src: 'assets/cancion.mp3', title: 'If Only · Dove Cameron' }),
});
