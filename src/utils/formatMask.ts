// Transforma número em "R$ 1.234,56"
export const maskCurrency = (value: string) => {
    value = value.replace(/\D/g, "");
    value = (Number(value) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
    return value;
};

// Transforma "R$ 1.234,56" em 1234.56 (para o banco)
export const unmaskCurrency = (value: string) => {
    if (!value) return null;
    return parseFloat(value.replace(/[^\d,]/g, "").replace(",", "."));
};