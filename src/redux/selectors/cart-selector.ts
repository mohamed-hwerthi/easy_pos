import { RootState } from "../store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0)
);
