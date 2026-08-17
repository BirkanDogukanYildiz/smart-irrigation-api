// Backend enum'larıyla birebir eşleşir: com.belediye.bitkisulama.enums.Role / Status
export const ROLES = {
  ADMIN: "ADMIN",
  HEADGARDENER: "HEADGARDENER",
  GARDENER: "GARDENER",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  HEADGARDENER: "Personel Yetkilisi",
  GARDENER: "Personel",
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isManager(role) {
  return role === ROLES.ADMIN || role === ROLES.HEADGARDENER;
}

export const STATUS = {
  WORKING: "WORKING",
  FAULTY: "FAULTY",
};
