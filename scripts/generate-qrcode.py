#!/usr/bin/env python3
import qrcode

# Número do WhatsApp do time de vendas (especialistas)
whatsapp_numero = "5547933853726"
mensagem_padrao = "Olá! Gostaria de conhecer os planos Vital."

# URL do WhatsApp com mensagem pré-preenchida
whatsapp_url = f"https://wa.me/{whatsapp_numero}?text={mensagem_padrao}"

# Criar QR Code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(whatsapp_url)
qr.make(fit=True)

# Gerar imagem
img = qr.make_image(fill_color="#1e9d9f", back_color="white")

# Salvar na pasta public do cliente
output_path = "/home/ubuntu/vital-credenciados/client/public/qrcode-whatsapp-vendas.png"
img.save(output_path)

print(f"✅ QR Code gerado com sucesso: {output_path}")
print(f"📱 URL: {whatsapp_url}")
