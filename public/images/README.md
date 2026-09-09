
# Image Setup Instructions

This directory stores the community gallery photographs for the Anyuola-hub platform.

## Photos to Upload

Four community photos have been configured in the gallery system:

### 1. community-meeting-discussion.jpg
- **Title:** Community Meeting - Leadership Discussion
- **Section:** Leadership in Action (Consultation section on About page)
- **Category:** Civil & Leadership
- **Description:** Elders and executive officials in high-level consultative sessions with civil leaders and regional stakeholders

### 2. outdoor-assembly-gathering.jpg
- **Title:** Outdoor Assembly - Community Gathering
- **Category:** Welfare & Assembly
- **Description:** Members of Mifuong'o Raruoch assembled outdoors in collaborative discussion and welfare assembly

### 3. indoor-forum-synod.jpg
- **Title:** Indoor Forum - Leadership Synod
- **Category:** Governance & Vetting
- **Description:** Executive leadership and committee members convening in formal indoor session

### 4. community-hall-assembly.jpg
- **Title:** Community Hall Assembly - Welfare Discussion
- **Section:** Well-Wishers & Friends section on About page
- **Category:** Welfare & Assembly
- **Description:** Members gathered in community hall setting for welfare fund discussions

## How to Upload Images

### Option A: Using GitHub Web Interface
1. Go to https://github.com/OdhisOdhat/Anyuola-hub/tree/main/public/images
2. Click "Add file" → "Upload files"
3. Drag and drop or select the 4 JPG photos
4. Name them exactly as shown above
5. Commit with message: "Upload community gallery photos"

### Option B: Using Git Command Line
```bash
git clone https://github.com/OdhisOdhat/Anyuola-hub.git
cd Anyuola-hub/public/images

# Copy your 4 photos here with the exact filenames

git add *.jpg
git commit -m "Upload community gallery photos"
git push origin main
```

## Photo Specifications

- **Format:** JPG/JPEG
- **Recommended Size:** 1200x900px or similar 4:3 aspect ratio
- **File Size:** Keep under 500KB each for optimal performance
- **Quality:** High resolution for clear gallery display

## Integration Status

✅ Gallery metadata configured in `public/gallery.json`
✅ About page sections linked to photos
⏳ Awaiting image file uploads to complete integration

Once images are uploaded, they will automatically appear in:
- Gallery page (filterable by category)
- About page "Leadership in Action" section
- About page "Well-Wishers & Friends" section
