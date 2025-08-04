import { jest } from '@jest/globals';
import { handleSunoCallback } from '../src/handlers/songHandler';
import fetchMock from 'fetch-mock';

// --- MOCK DE DATOS Y SERVICIOS EXTERNOS ---

const mockCallbackBody = {
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "task_id": "2fac-mock-task",
    "data": [
      {
        "id": "song-id-1",
        "audio_url": "https://mock.url/song1.mp3",
        "source_audio_url": "https://mock.url/song1_source.mp3",
        "stream_audio_url": "https://mock.url/song1_stream",
        "source_stream_audio_url": "https://mock.url/song1_source_stream",
        "image_url": "https://mock.url/song1.jpeg",
        "source_image_url": "https://mock.url/song1_source.jpeg",
        "prompt": "[Verse] Mock night city lights shining bright",
        "model_name": "chirp-v3-5",
        "title": "Mock Song One",
        "tags": "electrifying, rock",
        "createTime": "2025-08-04 03:00:00",
        "duration": 198.44
      },
      {
        "id": "song-id-2",
        "audio_url": "https://mock.url/song2.mp3",
        "source_audio_url": "https://mock.url/song2_source.mp3",
        "stream_audio_url": "https://mock.url/song2_stream",
        "source_stream_audio_url": "https://mock.url/song2_source_stream",
        "image_url": "https://mock.url/song2.jpeg",
        "source_image_url": "https://mock.url/song2_source.jpeg",
        "prompt": "[Verse] Mock night city lights shining bright",
        "model_name": "chirp-v3-5",
        "title": "Mock Song Two",
        "tags": "electrifying, rock",
        "createTime": "2025-08-04 03:00:00",
        "duration": 228.28
      }
    ]
  }
}; const mockAudioFile = new ArrayBuffer(10);

const mockRun = jest.fn(() => ({
  success: true,
  meta: { changes: 1 }
}));

const mockBind = jest.fn(() => ({
  run: mockRun,
}));

const mockPrepare = jest.fn(() => ({
  bind: mockBind,
}));

const mockEnv = {
  SONGS_DB: {
    prepare: mockPrepare,
  },
  SONGS_STORAGE: {
    put: jest.fn(() => Promise.resolve()),
  },
};

// --- SUITE DE PRUEBAS ---

describe('handleSunoCallback', () => {

  beforeEach(() => {
    fetchMock.reset();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('debe procesar el callback y guardar las canciones si todo es exitoso', async () => {
    // Configurar los mocks de fetch...
    fetchMock.get('https://mock.url/song1.mp3', { body: mockAudioFile, status: 200 });
    fetchMock.get('https://mock.url/song2.mp3', { body: mockAudioFile, status: 200 });

    const mockRequest = new Request('https://mock.url/suno-callback', {
      method: 'POST',
      body: JSON.stringify(mockCallbackBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await handleSunoCallback(mockRequest, mockEnv);

    expect(response.status).toBe(200);

    // Las afirmaciones son ahora mucho más sencillas y directas
    // Verificar que la tarea se actualizó en la BD
    expect(mockPrepare).toHaveBeenCalledWith("UPDATE tasks SET status = ? WHERE id = ?");
    expect(mockBind).toHaveBeenCalledWith("SUCCESS", "2fac-mock-task");

    // Verificar que cada canción se procesó
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO songs"));

    // Verificar que se insertaron las canciones
    expect(mockBind).toHaveBeenCalledWith("song-id-1", "Mock Song One", "2fac-mock-task");
    expect(mockBind).toHaveBeenCalledWith("song-id-2", "Mock Song Two", "2fac-mock-task");

    // Verificar que los archivos se guardaron en R2
    expect(mockEnv.SONGS_STORAGE.put).toHaveBeenCalledTimes(2);
    expect(mockEnv.SONGS_STORAGE.put).toHaveBeenCalledWith("song-id-1", mockAudioFile);
    expect(mockEnv.SONGS_STORAGE.put).toHaveBeenCalledWith("song-id-2", mockAudioFile);

    expect(fetchMock.called()).toBe(true);
    expect(fetchMock.calls()).toHaveLength(2);
  });
});
