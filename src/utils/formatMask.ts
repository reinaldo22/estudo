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


// Máscara dinâmica para CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)
export const maskDocument = (value: string) => {
    const v = value.replace(/\D/g, ''); // Remove tudo que não é número
    if (v.length <= 11) {
        return v
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
    return v
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Máscara para Telefone (00) 00000-0000
export const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};