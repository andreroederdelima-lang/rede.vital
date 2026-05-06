import qrcode

# Número do WhatsApp (mesmo do time de vendas)
whatsapp_number = "5547933853726"
message = "Olá, recebi uma indicação para conhecer mais sobre as assinaturas Vital"

# URL do WhatsApp com mensagem
whatsapp_url = f"https://wa.me/{whatsapp_number}?text={message.replace(' ', '%20')}"

# Criar QR Code grande (versão 5 = ~37x37 módulos)
qr = qrcode.QRCode(
    version=5,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=15,  # Tamanho maior para impressão
    border=4,
)
qr.add_data(whatsapp_url)
qr.make(fit=True)

# Criar imagem com cor turquesa Vital
img = qr.make_image(fill_color="#1e9d9f", back_color="white")
img.save("client/public/qrcode-indicacao-vital.png")
print("QR Code de indicação gerado: client/public/qrcode-indicacao-vital.png")
