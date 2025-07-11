import re
from typing import Dict, Optional, Any

def parse_filename(filename: str) -> Dict[str, Any]:
    """
    Parse filename to extract metadata like title, quality, source, format,
    season number, episode number, language, audio codec, subtitle info, etc.
    
    Example filenames:
    - "The Matrix (1999) 1080p BluRay x264.mkv"
    - "Breaking Bad S01E05 720p WEB-DL.mp4"
    - "Attack on Titan - Episode 12 [1080p] [HEVC].mkv"
    - "Jujutsu.Kaisen.S02E09.1080p.WEBRip.Multi.Audio.H.265.mkv"
    - "Iron.Man.2008.1080p.BluRay.x264.Hindi-English.mkv"
    - "Leviathan.S01E12.1080p.NF.WEB-DL.DDP5.1.H.265.mkv"
    """
    result = {
        "title": "",
        "slug": "",
        "year": None,
        "quality": None,
        "source": None,
        "format": None,
        "season": None,
        "episode": None,
        "language": None,
        "audio_codec": None,
        "subtitle_info": None,
        "group": None,
        "media_type": "movie"  # Default to movie
    }
    
    # Get original filename without extension for group extraction
    original_name = filename
    
    # Clean up filename (remove extension)
    clean_name = re.sub(r'\.[a-zA-Z0-9]+$', '', filename)
    
    # Try to extract year
    year_match = re.search(r'[\(\[\s.](\d{4})[\)\]\s.]', clean_name)
    if year_match:
        result["year"] = int(year_match.group(1))
        # Remove year from clean_name for further processing
        clean_name = re.sub(r'[\(\[\s.](\d{4})[\)\]\s.]', ' ', clean_name)
    
    # Check for series patterns
    # Standard S01E01 format
    series_match = re.search(r'S(\d{1,2})E(\d{1,2})', clean_name, re.IGNORECASE)
    # Alternative 1x01 format
    alt_series_match = re.search(r'(\d{1,2})x(\d{1,2})', clean_name)
    # Ep01 or Episode 01 format
    ep_match = re.search(r'(?:Ep|Episode)[\s._-]*(\d{1,2})', clean_name, re.IGNORECASE)
    
    if series_match:
        result["media_type"] = "series"
        result["season"] = int(series_match.group(1))
        result["episode"] = int(series_match.group(2))
        # Extract title (everything before S01E01)
        title_part = clean_name.split(series_match.group(0))[0].strip()
        result["title"] = clean_title(title_part)
    elif alt_series_match:
        result["media_type"] = "series"
        result["season"] = int(alt_series_match.group(1))
        result["episode"] = int(alt_series_match.group(2))
        # Extract title (everything before 1x01)
        title_part = clean_name.split(alt_series_match.group(0))[0].strip()
        result["title"] = clean_title(title_part)
    elif ep_match:
        result["media_type"] = "series"
        result["season"] = 1  # Default to season 1 if not specified
        result["episode"] = int(ep_match.group(1))
        # Extract title (everything before Ep/Episode)
        split_term = "Ep" if "Ep" in clean_name else "Episode"
        title_part = re.split(f"{split_term}\\s*\\d+", clean_name, flags=re.IGNORECASE)[0].strip()
        result["title"] = clean_title(title_part)
    else:
        # For movies, title is everything before year or quality indicators
        title_end_markers = ['1080p', '720p', '480p', '2160p', 'BluRay', 'WEB-DL', 'WEBRip', 'HDTV', 'BRRip', 'DVDRip', 'x264', 'x265', 'HEVC', 'H.265', 'H264']
        title_end_pos = len(clean_name)
        
        for marker in title_end_markers:
            pos = clean_name.lower().find(marker.lower())
            if pos > 0 and pos < title_end_pos:
                title_end_pos = pos
        
        result["title"] = clean_title(clean_name[:title_end_pos])
    
    # Generate slug from title
    result["slug"] = generate_slug(result["title"])
    
    # Extract quality (2160p, 1080p, 720p, 480p, etc.)
    quality_match = re.search(r'(2160p|1080p|720p|480p)', clean_name, re.IGNORECASE)
    if quality_match:
        result["quality"] = quality_match.group(1).lower()
    
    # Extract source (BluRay, WEB-DL, HDTV, etc.)
    source_match = re.search(r'(BluRay|WEB-DL|WEBRip|HDTV|BRRip|DVDRip|NF)', clean_name, re.IGNORECASE)
    if source_match:
        result["source"] = source_match.group(1).lower()
    
    # Extract format (x264, x265, HEVC, H.265, etc.)
    format_match = re.search(r'(x264|x265|HEVC|H\.265|H264|AVC)', clean_name, re.IGNORECASE)
    if format_match:
        result["format"] = format_match.group(1).lower()
    
    # Extract language (Hindi, English, Multi Audio, Dual Audio, etc.)
    language_patterns = [
        r'(Hindi-English|Hindi|Bengali|Tamil|Telugu|Multi[\s._-]*Audio|Dual[\s._-]*Audio)',
        r'(English|Japanese|Korean|Chinese|Spanish|French|German)'
    ]
    
    for pattern in language_patterns:
        language_match = re.search(pattern, clean_name, re.IGNORECASE)
        if language_match:
            result["language"] = language_match.group(1).replace('.', ' ').strip().lower()
            break
    
    # Extract audio codec (DDP5.1, AAC, DTS, TrueHD, FLAC, etc.)
    audio_codec_match = re.search(r'(DDP5\.1|DDP[0-9]\.[0-9]|AAC|DTS|TrueHD|FLAC|AC3|EAC3|Atmos)', clean_name, re.IGNORECASE)
    if audio_codec_match:
        result["audio_codec"] = audio_codec_match.group(1).lower()
    
    # Extract subtitle info (Subbed, Dubbed, English Sub, Dual Subs, etc.)
    subtitle_patterns = [
        r'(Subbed|Dubbed|English[\s._-]*Sub|Dual[\s._-]*Subs?|Multi[\s._-]*Subs?)',
        r'(Soft[\s._-]*Subs?|Hard[\s._-]*Subs?)'
    ]
    
    for pattern in subtitle_patterns:
        subtitle_match = re.search(pattern, clean_name, re.IGNORECASE)
        if subtitle_match:
            result["subtitle_info"] = subtitle_match.group(1).replace('.', ' ').strip().lower()
            break
    
    # Extract release group (usually at the end of filename before extension)
    # Common groups: YIFY, PSA, EVO, Telly, Archie, Tigole, QxR, NTb
    group_match = re.search(r'[-\.\[]([A-Za-z0-9]+)[\.\]]?$', original_name)
    if group_match:
        result["group"] = group_match.group(1).lower()
    else:
        # Try to find common release groups in the filename
        group_patterns = r'(YIFY|PSA|EVO|Telly|Archie|Tigole|QxR|NTb|RARBG|SPARKS|FGT|GECKOS)'
        common_group = re.search(group_patterns, original_name, re.IGNORECASE)
        if common_group:
            result["group"] = common_group.group(1).lower()
    
    return result

def clean_title(title: str) -> str:
    """
    Clean up title by removing dots, extra spaces, and other separators
    """
    # Replace dots, underscores with spaces
    title = re.sub(r'[._]', ' ', title)
    # Remove any brackets and their contents
    title = re.sub(r'\[.*?\]|\(.*?\)', '', title)
    # Remove any remaining special characters
    title = re.sub(r'[\-_]', ' ', title)
    # Remove extra spaces
    title = re.sub(r'\s+', ' ', title)
    return title.strip()

def generate_slug(title: str) -> str:
    """
    Generate a SEO-friendly slug from title
    """
    # Convert to lowercase
    slug = title.lower()
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Remove any non-alphanumeric characters except hyphens
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading and trailing hyphens
    slug = slug.strip('-')
    return slug