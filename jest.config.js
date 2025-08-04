export default {
  // Configuración para usar Módulos ES
  // Esto deshabilita el transformador por defecto de Jest, que es para CommonJS
  transform: {},

  // La raíz de tu proyecto para encontrar los archivos
  rootDir: '.',

  // Ignora la transformación para archivos en node_modules, excepto para
  // módulos ES que deban ser transformados
  transformIgnorePatterns: [
    '/node_modules/(?!(fetch-mock|other-esm-lib)/)',
  ],
};
