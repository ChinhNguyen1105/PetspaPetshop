import { create } from "zustand";
import AddressService from "../services/addressService";

export const useAddressStore = create((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  // ───────────────────────── FETCH ─────────────────────────
  fetchAddresses: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const res = await AddressService.getAddresses();

      const addresses = Array.isArray(res?.body?.data)
        ? res.body.data
        : [];

      set({
        addresses,
        isLoading: false,
      });
    } catch (err) {
      set({
        error:
          err?.response?.data?.message ||
          "Failed to fetch addresses",
        isLoading: false,
      });
    }
  },

  // ───────────────────────── CREATE ─────────────────────────
  addAddress: async (addressData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const res = await AddressService.createAddress(addressData);
      const newAddress = res?.body?.data;

      if (!newAddress) {
        throw new Error("Invalid create address response");
      }

      const current = get().addresses;

      const normalizedNewAddress = {
        ...newAddress,
        id: String(newAddress.id),
      };

      const updatedList = normalizedNewAddress.isDefault
        ? current.map((address) => ({
            ...address,
            isDefault: false,
          }))
        : current;

      set({
        addresses: [
          ...updatedList,
          normalizedNewAddress,
        ],
        isLoading: false,
      });

      return {
        success: true,
        data: normalizedNewAddress,
      };
    } catch (err) {
      set({
        isLoading: false,
        error:
          err?.response?.data?.message ||
          "Create address failed",
      });

      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Create address failed",
      };
    }
  },

  // ───────────────────────── UPDATE ─────────────────────────
  editAddress: async (id, addressData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const res = await AddressService.updateAddress(
        id,
        addressData
      );

      const updated = res?.body?.data;

      if (!updated) {
        throw new Error("Invalid update address response");
      }

      const normalizedUpdated = {
        ...updated,
        id: String(updated.id ?? id),
      };

      const targetId = String(id);

      const updatedList = get().addresses.map((item) => {
        if (String(item.id) === targetId) {
          return normalizedUpdated;
        }

        if (normalizedUpdated.isDefault) {
          return {
            ...item,
            isDefault: false,
          };
        }

        return item;
      });

      set({
        addresses: updatedList,
        isLoading: false,
      });

      return {
        success: true,
        data: normalizedUpdated,
      };
    } catch (err) {
      set({
        isLoading: false,
        error:
          err?.response?.data?.message ||
          "Update address failed",
      });

      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Update address failed",
      };
    }
  },

  // ───────────────────────── DELETE ─────────────────────────
  removeAddress: async (id) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      await AddressService.deleteAddress(id);

      const targetId = String(id);

      set({
        addresses: get().addresses.filter(
          (address) =>
            String(address.id) !== targetId
        ),
        isLoading: false,
      });

      return {
        success: true,
      };
    } catch (err) {
      set({
        isLoading: false,
        error:
          err?.response?.data?.message ||
          "Delete address failed",
      });

      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Delete address failed",
      };
    }
  },

  // ───────────────────────── SET DEFAULT ─────────────────────────
  markAsDefault: async (id) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      await AddressService.setDefaultAddress(id);

      const targetId = String(id);

      set({
        addresses: get().addresses.map((address) => ({
          ...address,
          isDefault:
            String(address.id) === targetId,
        })),
        isLoading: false,
      });

      return {
        success: true,
      };
    } catch (err) {
      set({
        isLoading: false,
        error:
          err?.response?.data?.message ||
          "Set default address failed",
      });

      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Set default address failed",
      };
    }
  },
}));
