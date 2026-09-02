import { describe, it, expect, vi, Mock } from "vitest";
import { getShippingLocations, calculateShippingRates } from "../domains/shipping/controllers/ShippingController";
import { Request, Response } from "express";

describe("ShippingController", () => {
  it("should get shipping locations with wilayas", async () => {
    const req = {} as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    await getShippingLocations(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.wilayas).toBeInstanceOf(Array);
    expect(responseData.data.wilayas.length).toBeGreaterThan(0);
    expect(responseData.data.wilayas[0]).toHaveProperty("id");
    expect(responseData.data.wilayas[0]).toHaveProperty("name");
  });

  it("should calculate shipping rates for default wilaya", async () => {
    const req = {
      body: {},
    } as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    await calculateShippingRates(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data).toHaveProperty("home_fee");
    expect(responseData.data).toHaveProperty("desk_fee");
    expect(responseData.data).toHaveProperty("delay");
  });

  it("should calculate shipping rates for a matching wilaya", async () => {
    const req = {
      body: { wilaya_name: "Alger" },
    } as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    await calculateShippingRates(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.home_fee).toBeDefined();
    expect(responseData.data.desk_fee).toBeDefined();
  });

  it("should handle invalid request body or fallback grace", async () => {
    const req = {
      body: null,
    } as unknown as Request;
    const res = {
      json: vi.fn(),
    } as unknown as Response;

    await calculateShippingRates(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = (res.json as Mock).mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.data.home_fee).toBe(600);
  });
});
