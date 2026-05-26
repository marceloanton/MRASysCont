export type LicenseStatus = {
  mode: "evaluation" | "commercial";
  hasCommercialKey: boolean;
  enforceCommercialLicense: boolean;
  message: string;
};

function isTruthy(value: string | undefined) {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function getLicenseStatus(): LicenseStatus {
  const key = process.env.MRASYSCONT_LICENSE_KEY?.trim();
  const hasCommercialKey = Boolean(key);
  const enforceCommercialLicense = isTruthy(process.env.MRASYSCONT_ENFORCE_LICENSE);

  if (hasCommercialKey) {
    return {
      mode: "commercial",
      hasCommercialKey,
      enforceCommercialLicense,
      message: "Licencia comercial configurada."
    };
  }

  return {
    mode: "evaluation",
    hasCommercialKey,
    enforceCommercialLicense,
    message:
      "Modo evaluacion/no comercial. Para uso comercial y facturacion real se requiere licencia paga."
  };
}

export function assertCommercialLicenseForBilling() {
  const status = getLicenseStatus();

  if (status.enforceCommercialLicense && !status.hasCommercialKey) {
    throw new Error(
      "Uso comercial bloqueado: falta MRASYSCONT_LICENSE_KEY. Revisar TERMS.md y COMMERCIAL_LICENSE.md."
    );
  }
}

