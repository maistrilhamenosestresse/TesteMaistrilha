import os
from pathlib import Path
from PIL import Image
from pillow_heif import register_heif_opener

# Habilita o suporte a arquivos HEIC na biblioteca PIL
register_heif_opener()

def convert_heic_to_webp(directory):
    path = Path(directory)
    print(f"Buscando arquivos HEIC em: {path.absolute()}")
    count = 0
    
    # Busca recursivamente todos os arquivos .heic (case-insensitive)
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.lower().endswith('.heic'):
                heic_path = os.path.join(root, file)
                webp_filename = file.rsplit('.', 1)[0] + '.webp'
                webp_path = os.path.join(root, webp_filename)
                
                # Pula se já houver convertido
                if os.path.exists(webp_path):
                    continue
                
                try:
                    # Abre e converte para WEBP otimizado
                    image = Image.open(heic_path)
                    image.save(webp_path, format="WEBP", quality=80)
                    print(f"[OK] Convertido: {file} -> {webp_filename}")
                    count += 1
                except Exception as e:
                    print(f"[ERRO] Falha ao converter {file}: {e}")

    print(f"Concluído! {count} arquivos convertidos.")

if __name__ == "__main__":
    convert_heic_to_webp("public/FotosEvideos")
