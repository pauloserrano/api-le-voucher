import { jest } from "@jest/globals"
import voucherService from "../../src/services/voucherService"
import voucherRepository from "../../src/repositories/voucherRepository"
import * as voucherFactory from "../factories/voucherFactory"

describe("createVoucher", () => {
  const mockVoucher = voucherFactory.generateValidVoucher()

  it("Should not create two vouchers with the same code", () => {
    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => mockVoucher)

    const promise = voucherService.createVoucher(mockVoucher.code, mockVoucher.discount)
    expect(promise).rejects.toEqual(expect.objectContaining({
      type: "conflict"
    }))
  })

  it("Should create a new voucher when code is new", async () => {
    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {})
    jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => {
      return "voucher created"
    })

    const result = voucherService.createVoucher(mockVoucher.code, mockVoucher.discount)
    expect(result).toBeInstanceOf(Promise)
  })
})

describe("applyVoucher", () => {
  const mockVoucher = voucherFactory.generateValidVoucher()

  it("Should throw error when voucher does not exist", () => {
    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {})

    const result = voucherService.applyVoucher(mockVoucher.code, 100)
    expect(result).rejects.toEqual(expect.objectContaining({
      message: "Voucher does not exist."
    }))
  })

  
  it("Should not give discount when voucher was already used", async () => {
    const amount = 100
    const usedVoucher = {
      ...mockVoucher,
      used: true
    }

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementation((): any => usedVoucher)

    const result = await voucherService.applyVoucher(usedVoucher.code, amount)
    expect(result).toEqual(expect.objectContaining({
      applied: false
    }))
  })
  
  it("Should not give discount when amount is too low", async () => {
    const amount = 10

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementation((): any => mockVoucher)

    const result = await voucherService.applyVoucher(mockVoucher.code, amount)
    expect(result).toEqual(expect.objectContaining({
      applied: false
    }))
  })
  
  it("Should apply voucher for valid amount", async () => {
    const amount = 200

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementation((): any => mockVoucher)
    jest.spyOn(voucherRepository, "useVoucher").mockImplementation((): any => {})

    const result = await voucherService.applyVoucher(mockVoucher.code, amount)
    expect(result).toEqual({
      amount,
      discount: mockVoucher.discount,
      finalAmount: amount - (amount * (mockVoucher.discount / 100)),
      applied: true
    })
  })
})