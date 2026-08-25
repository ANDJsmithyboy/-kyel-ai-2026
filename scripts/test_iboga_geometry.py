"""
Test and refine Iboga SVG glyph geometry.
"""

def generate_svg_variants():
    # Variant 1: Pure stroke minimal geometric Iboga (Stem + 2 asymmetric leaves + 3 root terminals)
    svg_v1 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <!-- Central Stem & Intelligence Node -->
  <path d="M12 4.5V16" />
  <circle cx="12" cy="4.5" r="1" fill="currentColor" stroke="none" />
  
  <!-- Geometric Leaves -->
  <!-- Left leaf -->
  <path d="M12 10.5C9.2 9 7.2 10.2 6.5 11.8C8.5 12.5 10.8 12 12 11" />
  <!-- Right upper leaf -->
  <path d="M12 8C14.8 6.5 16.8 7.8 17.5 9.5C15.5 10.2 13.2 9.5 12 8.5" />
  
  <!-- Root / Network Gesture -->
  <path d="M12 16C10.2 17.8 7.8 18.8 6 19.2" />
  <path d="M12 16C13.8 17.8 16.2 18.8 18 19.2" />
  <path d="M12 16V20" />
</svg>'''

    # Variant 2: Ultra-refined Apple/Geist precision (Optical balance, 1.75 stroke, perfect negative space)
    svg_v2 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <!-- Upper Bud / Node -->
  <circle cx="12" cy="4" r="1.1" fill="currentColor" stroke="none" />
  <path d="M12 5.2V15.5" />
  
  <!-- Left Foliole (Iboga signature leaf curvature) -->
  <path d="M12 11C8.8 9.5 6.8 10.8 6 12.2C8 13 10.5 12.4 12 11.5" />
  
  <!-- Right Foliole -->
  <path d="M12 8.5C15.2 7 17.2 8.3 18 9.8C16 10.5 13.5 10 12 9" />
  
  <!-- Root / Ground Neural Network -->
  <path d="M12 15.5C10 17.5 7.5 18.5 5.5 19" />
  <path d="M12 15.5C14 17.5 16.5 18.5 18.5 19" />
  <path d="M12 15.5V19.8" />
  <circle cx="5.5" cy="19" r="0.75" fill="currentColor" stroke="none" />
  <circle cx="18.5" cy="19" r="0.75" fill="currentColor" stroke="none" />
  <circle cx="12" cy="19.8" r="0.75" fill="currentColor" stroke="none" />
</svg>'''

    # Variant 3: Sleek Modernist Line-Art (Streamlined without dots at bottom for extreme 16px clarity)
    svg_v3 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <!-- Central Stem & Apex -->
  <path d="M12 3.5V16" />
  <path d="M10.2 4.8C11 3.8 12 3.5 12 3.5C12 3.5 13 3.8 13.8 4.8" />
  
  <!-- Left Leaf (Iboga botanical form) -->
  <path d="M12 10.5C8.8 9.2 6.8 10.4 6 12C8.2 12.6 10.6 12 12 11.2" />
  
  <!-- Right Leaf -->
  <path d="M12 8C15.2 6.7 17.2 7.9 18 9.5C15.8 10.1 13.4 9.5 12 8.7" />
  
  <!-- Root Network Connection -->
  <path d="M12 16C9.8 17.6 7.5 18.6 5.5 19" />
  <path d="M12 16C14.2 17.6 16.5 18.6 18.5 19" />
  <path d="M12 16V20" />
</svg>'''

    with open(r"F:\Nkyel-AI-2026\scripts\preview_iboga.html", "w", encoding="utf-8") as f:
        f.write(f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Iboga Glyph Verification (16px to 48px)</title>
<style>
body {{ background: #090B0E; color: #FAFAF8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; }}
.light {{ background: #FAFAF8; color: #111418; padding: 20px; border-radius: 12px; margin-top: 20px; }}
.grid {{ display: flex; gap: 30px; align-items: center; margin: 20px 0; }}
.card {{ display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 11px; }}
h2 {{ font-weight: 500; font-size: 16px; margin-top: 30px; color: #D5AE57; }}
</style>
</head>
<body>
<h1>Iboga UI Signature Glyph Verification</h1>

<h2>Variant 3 — Sleek Modernist Line-Art (Recommended: Geist & Apple Precision)</h2>
<div class="grid">
  <div class="card"><div style="width:16px;height:16px;">{svg_v3}</div><span>16px</span></div>
  <div class="card"><div style="width:18px;height:18px;">{svg_v3}</div><span>18px</span></div>
  <div class="card"><div style="width:20px;height:20px;">{svg_v3}</div><span>20px</span></div>
  <div class="card"><div style="width:22px;height:22px;">{svg_v3}</div><span>22px</span></div>
  <div class="card"><div style="width:24px;height:24px;">{svg_v3}</div><span>24px</span></div>
  <div class="card"><div style="width:32px;height:32px;">{svg_v3}</div><span>32px</span></div>
  <div class="card"><div style="width:48px;height:48px;">{svg_v3}</div><span>48px</span></div>
</div>

<div class="light">
  <h2 style="color:#8A6D3B; margin-top:0;">Light Mode Check</h2>
  <div class="grid">
    <div class="card"><div style="width:16px;height:16px;">{svg_v3}</div><span>16px</span></div>
    <div class="card"><div style="width:18px;height:18px;">{svg_v3}</div><span>18px</span></div>
    <div class="card"><div style="width:20px;height:20px;">{svg_v3}</div><span>20px</span></div>
    <div class="card"><div style="width:24px;height:24px;">{svg_v3}</div><span>24px</span></div>
  </div>
</div>
</body>
</html>''')
    print("HTML preview generated.")

if __name__ == "__main__":
    generate_svg_variants()
