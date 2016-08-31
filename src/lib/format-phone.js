function formatPhone(phone, doFormat) {
    if (doFormat) {
        phone = phone.replace(/[^0-9]/g, '');
        phone = phone.replace(/(\d{3})(\d{3})(\d{3})/, "($1) $2-$3");
        return phone;
    } else {
        return phone.replace(/[^0-9]/g, '');
    }
}