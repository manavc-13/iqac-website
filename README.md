<p align="center">
  <img src="assets/logos/iqac_logo.png" alt="KIIT IQAC Logo" width="150"/>
</p>

# KIIT Internal Quality Assurance Cell (IQAC) Website

This repository contains the official website for the Internal Quality Assurance Cell (IQAC) of Kalinga Institute of Industrial Technology (KIIT), Deemed to be University. The website aims to provide comprehensive information about IQAC's functions, objectives, policies, reports, events, and its role in maintaining and enhancing the quality of education and institutional processes at KIIT.

## Live Site
`https://iqac-website.vercel.app/`

## Features

* **Informative Pages:** Detailed sections on IQAC's vision, mission, objectives, and composition.
* **Document Access:** Easy access to important documents like the IQAC Brochure, AQAR reports, SSR documents, NAAC reports, annual reports, and feedback analyses.
* **Policy Information:** Clearly outlined institutional policies and guidelines related to quality assurance, teaching-learning, feedback, and Outcome-Based Education (OBE).
* **Events & Gallery:** Information on past and upcoming events, workshops, and quality initiatives organized or supported by IQAC.
* **Responsive Design:** The website is designed to be accessible on various devices.
* **Modern UI/UX:** Clean and user-friendly interface with animations for a better user experience.
* **Client-Side Includes:** Header and footer are loaded dynamically using JavaScript.

## Website Pages

The website includes the following main pages:

* **Home (`index.html`):** Overview, accreditations, rankings, and a snippet about KIIT.
* **About IQAC (`about.html`):** Vision, mission, objectives, IQAC brochure, Dean's message, and composition of IQAC.
* **Policies & Guidelines (`policies.html`):** Details on Quality Policy, Teaching-Learning Policy, Feedback Policy, and OBE framework.
* **Reports & Publications (`reports.html`):** Links to AQAR, SSR, NAAC reports, Annual Reports, and Feedback summaries.
* **Events & Gallery (`events.html`):** Showcases IQAC events, functions, activities, and quality initiatives.

## Technologies Used

* **HTML5**
* **CSS3:**
    * Custom CSS (`css/style.css`)
    * Tailwind CSS (via CDN)
* **JavaScript (ES6+):**
    * Custom scripts for dynamic content loading (header/footer), mobile menu, smooth scroll, event filtering, etc. (`js/script.js`).
* **AOS (Animate On Scroll) Library:** For scroll animations (via CDN).
* **Google Fonts:** Bebas Neue & Poppins.

## Local Development

To run this website locally, you'll need a simple HTTP server because the JavaScript `fetch` API (used for loading the header and footer) has security restrictions when running files directly from the local file system (`file:///`).

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd iqac-website
    ```

2.  **Start a local HTTP server:**
    Python 3 has a built-in HTTP server, which you mentioned using:
    ```bash
    # Navigate to the iqac-website directory
    python -m http.server
    ```
    Or, if you have Node.js installed, you can use a package like `live-server`:
    ```bash
    npm install -g live-server
    live-server
    ```

3.  **Open in browser:**
    Access the website, typically at `http://localhost:8000` (for Python's server) or `http://localhost:8080` (for `live-server`).

The `_header.html` and `_footer.html` files are injected into each page using the `loadHTML` function in `js/script.js`.

## Project Structure
This project follows a standard structure for a static website:
```
.
├── README.md               # This documentation file
├── index.html              # Main landing page of the website
├── about.html              # About IQAC, vision, mission, team
├── events.html             # IQAC events, activities, and gallery
├── policies.html           # Institutional policies and guidelines
├── reports.html            # AQAR, SSR, and other reports
├── _header.html            # Reusable header content, loaded via JS
├── _footer.html            # Reusable footer content, loaded via JS
├── assets/
│   ├── documents/          # PDF files (e.g., iqac_brochure.pdf)
│   ├── images/             # General imagery, logos, team photos
│   └── logos/
├── css/
│   └── style.css           # Custom stylesheets for the website
└── js/
    └── script.js           # Main JavaScript for site functionalities (including header/footer loading)
```


## Notable Documents
* **IQAC Brochure:** Provides a comprehensive overview of the IQAC's role and functions. Available at `assets/documents/iqac_brochure.pdf`.

---

## ©️ Copyright and Authorship

This website is the copyrighted property of Kalinga Institute of Industrial Technology (KIIT), Deemed to be University. It is not under any open-source license.

Developed by Manav Choudhary.
