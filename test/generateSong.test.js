import { jest } from '@jest/globals';
import fetchMock from 'fetch-mock';
import { generateSong } from '../src/services/songService.js'; // Asegúrate de que la ruta sea correcta

// --- MOCK DE DATOS Y RESPUESTAS DE API ---

const mockName = "Alvaro";
const mockAge = 35;
const mockApiKey = "mock-api-key";

// Respuesta de API exitosa
const mockSuccessResponse = {
  code: 200,
  msg: "ok",
  data: {
    taskId: "mock-task-123"
  }
};

// Respuesta de API con error interno
const mockApiErrorResponse = {
  code: 400,
  msg: "Parámetros de entrada inválidos."
};

// --- SUITE DE PRUEBAS ---

describe('generateSong', () => {
  beforeEach(() => {
    fetchMock.reset();
    jest.clearAllMocks();
    // Oculta los errores de consola para no contaminar la salida de Jest
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    // Restaura la función original de console.error
    jest.restoreAllMocks();
  });

  // Escenario 1: Petición exitosa
  test('debe devolver el objeto de respuesta si la llamada a la API es exitosa', async () => {
    // 1. Configurar el mock para que devuelva una respuesta exitosa
    fetchMock.post('https://api.sunoapi.org/api/v1/generate', mockSuccessResponse);

    // 2. Ejecutar la función
    const result = await generateSong(mockName, mockAge, mockApiKey);

    // 3. Afirmar los resultados
    expect(result).toEqual(mockSuccessResponse);
    expect(fetchMock.called()).toBe(true);

    // Opcional pero recomendado: verificar que la petición se hizo con el cuerpo correcto
    const call = fetchMock.lastCall();
    const requestBody = JSON.parse(call[1].body);

    expect(requestBody.title).toBe(`Cumpleaños de ${mockName}`);
    expect(requestBody.prompt).toContain(`felicidades a ${mockName}`);
    expect(requestBody.prompt).toContain(`numero ${mockAge}`);
  });

  // Escenario 2: Error interno de la API (código != 200)
  test('debe lanzar un error si la API de Suno devuelve un código de error', async () => {
    // 1. Configurar el mock para devolver un error de la API
    fetchMock.post('https://api.sunoapi.org/api/v1/generate', mockApiErrorResponse);

    // 2. Afirmar que la función lanza el error
    await expect(generateSong(mockName, mockAge, mockApiKey)).rejects.toThrow(
      "Error de la API de Suno (estado: 400): Parámetros de entrada inválidos."
    );
  });

  // Escenario 3: Respuesta con estructura inválida
  test('debe lanzar un error si la respuesta de la API no contiene taskId', async () => {
    // 1. Configurar el mock para devolver una respuesta sin taskId
    fetchMock.post('https://api.sunoapi.org/api/v1/generate', { code: 200, data: {} });

    // 2. Afirmar que la función lanza el error
    await expect(generateSong(mockName, mockAge, mockApiKey)).rejects.toThrow(
      "La respuesta de la API de Suno no contiene un taskId válido."
    );
  });

  // Escenario 4: Fallo de red
  test('debe propagar un error si la llamada fetch falla', async () => {
    // 1. Configurar el mock para simular un fallo de red
    fetchMock.post('https://api.sunoapi.org/api/v1/generate', { throws: new TypeError('Network error') });

    // 2. Afirmar que la función propaga el error
    await expect(generateSong(mockName, mockAge, mockApiKey)).rejects.toThrow(TypeError);
    expect(console.error).toHaveBeenCalled();
  });
});
