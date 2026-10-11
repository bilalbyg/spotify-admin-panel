import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import { afterEach, describe, expect, it, vi } from "vitest"
import { api } from "./api"

const ACCESS_TOKEN_KEY = "spotify-admin-access-token"
const REFRESH_TOKEN_KEY = "spotify-admin-refresh-token"
const USER_KEY = "spotify-admin-user"

const originalAdapter = api.defaults.adapter
const values = new Map<string, string>()

const localStorageMock = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
  clear: () => values.clear(),
}

function makeResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T
): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  }
}

function makeHttpError(
  status: number,
  config: InternalAxiosRequestConfig
): AxiosError {
  const response: AxiosResponse = {
    data: { message: "Request rejected" },
    status,
    statusText: status === 403 ? "Forbidden" : "Unauthorized",
    headers: {},
    config,
  }
  return new AxiosError(
    response.statusText,
    undefined,
    config,
    undefined,
    response
  )
}

afterEach(() => {
  values.clear()
  api.defaults.adapter = originalAdapter
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("API authentication refresh", () => {
  it("does not send a stale access token to public auth endpoints", async () => {
    vi.stubGlobal("localStorage", localStorageMock)
    localStorageMock.setItem(ACCESS_TOKEN_KEY, "expired-access")
    api.defaults.adapter = async (config) => {
      expect(config.headers.get("Authorization")).toBeUndefined()
      return makeResponse(config, { accepted: true })
    }

    const response = await api.post("/auth/login", {
      email: "admin@example.test",
      password: "password",
    })

    expect(response.data).toEqual({ accepted: true })
  })

  it("refreshes an expired access token and retries the original request", async () => {
    vi.stubGlobal("localStorage", localStorageMock)
    vi.stubGlobal("window", { location: { href: "/songs" } })
    localStorageMock.setItem(ACCESS_TOKEN_KEY, "expired-access")
    localStorageMock.setItem(REFRESH_TOKEN_KEY, "valid-refresh")

    const refreshRequest = vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        accessToken: "new-access",
        refreshToken: "new-refresh",
        username: "admin",
        email: "admin@example.test",
      },
    } as AxiosResponse)
    const requestAdapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.headers.get("Authorization") !== "Bearer new-access") {
        throw makeHttpError(401, config)
      }
      return makeResponse(config, { songs: [] })
    })
    api.defaults.adapter = requestAdapter

    const response = await api.get("/songs")

    expect(response.data).toEqual({ songs: [] })
    expect(refreshRequest).toHaveBeenCalledOnce()
    expect(requestAdapter).toHaveBeenCalledTimes(2)
    expect(localStorageMock.getItem(ACCESS_TOKEN_KEY)).toBe("new-access")
    expect(localStorageMock.getItem(REFRESH_TOKEN_KEY)).toBe("new-refresh")
  })

  it("shares one refresh request across concurrent expired requests", async () => {
    vi.stubGlobal("localStorage", localStorageMock)
    vi.stubGlobal("window", { location: { href: "/songs" } })
    localStorageMock.setItem(ACCESS_TOKEN_KEY, "expired-access")
    localStorageMock.setItem(REFRESH_TOKEN_KEY, "valid-refresh")

    const refreshRequest = vi.spyOn(axios, "post").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: {
                  accessToken: "new-access",
                  refreshToken: "new-refresh",
                  username: "admin",
                  email: "admin@example.test",
                },
              }),
            10
          )
        })
    )
    const requestAdapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.headers.get("Authorization") !== "Bearer new-access") {
        throw makeHttpError(401, config)
      }
      return makeResponse(config, { path: config.url })
    })
    api.defaults.adapter = requestAdapter

    const [songs, albums] = await Promise.all([
      api.get("/songs"),
      api.get("/albums"),
    ])

    expect(songs.data).toEqual({ path: "/songs" })
    expect(albums.data).toEqual({ path: "/albums" })
    expect(refreshRequest).toHaveBeenCalledOnce()
    expect(requestAdapter).toHaveBeenCalledTimes(4)
  })

  it("clears the session when the refreshed token is also unauthorized", async () => {
    vi.stubGlobal("localStorage", localStorageMock)
    const location = { href: "/songs" }
    vi.stubGlobal("window", { location })
    localStorageMock.setItem(ACCESS_TOKEN_KEY, "expired-access")
    localStorageMock.setItem(REFRESH_TOKEN_KEY, "valid-refresh")

    vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        accessToken: "rejected-access",
        refreshToken: "new-refresh",
        username: "admin",
        email: "admin@example.test",
      },
    } as AxiosResponse)
    const requestAdapter = vi.fn<AxiosAdapter>(async (config) => {
      throw makeHttpError(401, config)
    })
    api.defaults.adapter = requestAdapter

    await expect(api.get("/songs")).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(requestAdapter).toHaveBeenCalledTimes(2)
    expect(localStorageMock.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorageMock.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    expect(location.href).toBe("/login")
  })

  it("keeps the session when the server denies access with 403", async () => {
    vi.stubGlobal("localStorage", localStorageMock)
    const location = { href: "/songs" }
    vi.stubGlobal("window", { location })
    localStorageMock.setItem(ACCESS_TOKEN_KEY, "valid-access")
    localStorageMock.setItem(REFRESH_TOKEN_KEY, "valid-refresh")
    localStorageMock.setItem(
      USER_KEY,
      JSON.stringify({ email: "admin@example.test" })
    )
    api.defaults.adapter = async (config) => {
      throw makeHttpError(403, config)
    }

    await expect(api.get("/admin-only-resource")).rejects.toMatchObject({
      response: { status: 403 },
    })

    expect(localStorageMock.getItem(ACCESS_TOKEN_KEY)).toBe("valid-access")
    expect(localStorageMock.getItem(REFRESH_TOKEN_KEY)).toBe("valid-refresh")
    expect(localStorageMock.getItem(USER_KEY)).not.toBeNull()
    expect(location.href).toBe("/songs")
  })
})
