import { jest } from '@jest/globals';
import { handleGetSongRequest } from '../src/handlers/songHandler'; // Asegúrate de que la ruta sea correcta

// --- MOCK DE DATOS Y SERVICIOS EXTERNOS ---

const mockSongId = "abc-123";
const mockSongTitle = "Iron Man";
const mockAudioFile = new ArrayBuffer(10); // Archivo de audio simulado

// Mock del objeto D1 para simular la cadena de comandos
const mockFirst = jest.fn(() => ({ title: mockSongTitle }));
const mockBind = jest.fn(() => ({ first: mockFirst }));
const mockPrepare = jest.fn(() => ({ bind: mockBind }));

const mockEnv = {
  SONGS_STORAGE: {
    get: jest.fn(),
  },
  SONGS_DB: {
    prepare: mockPrepare,
  },
};

// --- SUITE DE PRUEBAS ---

describe('handleGetSongRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('debe devolver el archivo de audio con el título correcto si todo es exitoso', async () => {
    // 1. Configurar los mocks para este escenario
    mockEnv.SONGS_STORAGE.get.mockResolvedValue({ body: mockAudioFile });

    // 2. Ejecutar la función con los mocks
    const mockRequest = new Request(`https://example.com/song?songId=${mockSongId}`);
    const response = await handleGetSongRequest(mockRequest, mockEnv);

    // 3. Afirmar los resultados
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(response.headers.get("Content-Disposition")).toBe(`attachment; filename="${mockSongTitle}.mp3"`);

    const responseBody = await response.arrayBuffer();
    expect(responseBody).toEqual(mockAudioFile);

    // Verificar que los métodos de los mocks fueron llamados con los argumentos correctos
    expect(mockEnv.SONGS_STORAGE.get).toHaveBeenCalledWith(mockSongId);
    expect(mockEnv.SONGS_DB.prepare).toHaveBeenCalledWith("SELECT title FROM songs WHERE id = ?"); // Consulta corregida
    expect(mockBind).toHaveBeenCalledWith(mockSongId);
    expect(mockFirst).toHaveBeenCalled();
  });

  test('debe devolver 404 si la cancion no se encuentra en R2', async () => {
    // 1. Configurar los mocks
    mockEnv.SONGS_STORAGE.get.mockResolvedValue(null);

    // 2. Ejecutar la función
    const mockRequest = new Request(`https://example.com/song?songId=${mockSongId}`);
    const response = await handleGetSongRequest(mockRequest, mockEnv);
    const body = await response.json();

    // 3. Afirmar los resultados
    expect(response.status).toBe(404);
    expect(body.msg).toBe("Cancion no encontrada");

    // Asegurarse de que no se intentó consultar la base de datos
    expect(mockEnv.SONGS_DB.prepare).not.toHaveBeenCalled();
  });

  test('debe devolver 500 si la base de datos falla', async () => {
    // 1. Configurar los mocks para este escenario
    mockEnv.SONGS_STORAGE.get.mockResolvedValue({ body: mockAudioFile });

    // Configura el mock para que `prepare` devuelva un objeto que,
    // cuando se le llama a `bind`, devuelva otro objeto que,
    // cuando se le llama a `first`, lance un error.
    mockEnv.SONGS_DB.prepare.mockReturnValue({
      bind: () => ({
        first: () => {
          throw new Error("D1 simulated error");
        }
      })
    });

    // 2. Ejecutar la función
    const mockRequest = new Request(`https://example.com/song?songId=${mockSongId}`);
    const response = await handleGetSongRequest(mockRequest, mockEnv);
    const body = await response.text();

    // 3. Afirmar los resultados
    expect(response.status).toBe(500);
    expect(body).toContain("D1 simulated error");

    // Verificar que la función registró el error
    expect(console.error).toHaveBeenCalled();
  });
});
