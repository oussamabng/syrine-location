// A local copy of the 13 listings supplied by the user in screenshots.
// Prices/availability remain subject to owner confirmation; no live website data is fetched.
const row = (id,name,year,color,transmission,dailyPrice,dailyPriceEur,category,featured=false) => ({
  id,name,year,color,transmission,dailyPrice,dailyPriceEur,category,
  seats:5,fuel:'Essence',featured,available:true,sample:false,
  description:'Tarif indicatif. Disponibilité à confirmer avec Syrine.',
  images:[`/cars/${id}.webp`]
})
export const seedCars = [
  row('geely-coolray-2025','Geely Coolray',2025,'Gris','Automatique',12500,45,'SUV',true),
  row('geely-coolray-2026-gris','Geely Coolray',2026,'Gris','Manuelle',11000,40,'SUV',true),
  row('geely-coolray-2026-blanc','Geely Coolray',2026,'Blanc','Manuelle',9000,32,'SUV',true),
  row('fiat-tipo-2024','Fiat Tipo',2024,'Gris','Automatique',9500,35,'Berline'),
  row('renault-clio-5-2022','Renault Clio 5',2022,'Argent','Automatique',12000,45,'Citadine'),
  row('renault-clio-5-2021','Renault Clio 5',2021,'Argent','Manuelle',9500,35,'Citadine'),
  row('seat-arona-2018','Seat Arona',2018,'Noir','Manuelle',9500,35,'SUV'),
  row('seat-ibiza-2018','Seat Ibiza nouvelle',2018,'Noir','Manuelle',8500,30,'Citadine'),
  row('seat-ibiza-toit-ouvrant-2018','Seat Ibiza nouvelle',2018,'Noir','Manuelle',9500,35,'Citadine'),
  row('seat-ibiza-sol-2017','Seat Ibiza Sol',2017,'Blanc','Manuelle',7000,25,'Citadine'),
  row('dacia-stepway-2017','Dacia Stepway',2017,'Argent','Manuelle',7000,25,'Compacte'),
  row('renault-clio-4-2013','Renault Clio 4',2013,'Noir','Manuelle',6000,23,'Citadine'),
  row('audi-a3-2019','Audi A3',2019,'Gris','Automatique',25000,90,'Berline')
]
export const defaultDB = () => ({version:2,cars:structuredClone(seedCars),bookings:[],messages:[]})
