// Puerto
process.env.PORT = process.env.PORT || 3000;

//  Vencimiento del Token
// 60 segundos
// 60 minutos
// 24 horas
// 2 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 2;

//  SEED de autenticación
process.env.SEED = process.env.SEED || 'dev-seed';

//  Base de datos
process.env.URLDB = process.env.URLDB || 'mongodb://localhost:27017/Leicester';
