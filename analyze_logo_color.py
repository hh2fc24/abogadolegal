import collections
from PIL import Image

def get_border_color_stats(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGB")
        width, height = img.size
        
        # Collect all border pixels
        border_pixels = []
        
        # Top and Bottom rows
        for x in range(width):
            border_pixels.append(img.getpixel((x, 0)))
            border_pixels.append(img.getpixel((x, height-1)))
            
        # Left and Right columns
        for y in range(height):
            border_pixels.append(img.getpixel((0, y)))
            border_pixels.append(img.getpixel((width-1, y)))
            
        # Count frequencies
        counter = collections.Counter(border_pixels)
        most_common = counter.most_common(1)[0]
        color = most_common[0]
        
        return '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2]), most_common[1], len(border_pixels)
        
    except Exception as e:
        return str(e)

print(get_border_color_stats("public/logo_nav.jpeg"))
