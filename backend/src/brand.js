/* 
 * Pulse Backend — brand.js
 * File version: 0.1.0
 * Date: 2025-08-11
 * Purpose: Single source of truth for product naming/branding.
 */
export const BRAND = {
  APP_NAME: process.env.APP_NAME || "Pulse",
  APP_SHORT: process.env.APP_SHORT || process.env.APP_NAME || "Pulse",
  COMPANY: process.env.COMPANY || "SportConnect",
  COPYRIGHT: `© ${new Date().getFullYear()} ${process.env.COMPANY || "SportConnect"}`
};
