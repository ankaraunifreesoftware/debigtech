// Build tool for generating README.md

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const YAML = require('yaml');

const BUILD_SECTION = {
    header: () => readFile('md/_header.md').replace('{{DATE}}', moment().format('MMMM Do YYYY').replace(/ /g, '%20')),
    index: () => readFile('md/_index.md'),
    contributing: () => readFile('md/_contributing.md'),
    browserExtensions: () => generateBrowserExtensions(),
    disclaimer: () => readFile('md/_disclaimer.md'),
    webBasedProducts: () => generateCategorySection('Web tabanlı ürünler', readYaml()['web based products']),
    operatingSystems: () => generateCategorySection('İşletim sistemleri', readYaml()['operating systems']),
    desktopApps: () => generateCategorySection('Masaüstü uygulamaları', readYaml()['desktop applications']),
    mobileApps: () => generateCategorySection('Mobil uygulamaları', readYaml()['mobile applications']),
    hardware: () => generateCategorySection('Donanım', readYaml()['hardware']),
    useful: () => '# Faydalı linkler, araçlar ve öneriler',
    resources: () => readFile('md/_resources.md'),
    books: () => generatePublications('Kitaplar', 'books'),
    blogs: () => generatePublications('Blog yazıları', 'blogs'),
    news: () => generatePublications('Haber makaleleri', 'news'),
    lighterSide: () => readFile('md/_lighterSide.md'),
    closingRemarks: () => readFile('md/_closingRemarks.md')
};

// Button that brings the user to the top of the page
const BACK_TO_TOP = '[![Back to top](https://img.shields.io/badge/Back%20to%20top-lightgrey?style=flat-square)](#index)';

/**
 * Main method
 */
function __main__() {
    // dgSectionData will be join at the end and represents the full contents of README.md
    const dgSectionData = [];

    // Add all the sections
    dgSectionData.push(BUILD_SECTION.header());
    dgSectionData.push(BUILD_SECTION.index());
    dgSectionData.push(BUILD_SECTION.contributing());
    dgSectionData.push(BUILD_SECTION.browserExtensions());
    dgSectionData.push(BUILD_SECTION.disclaimer());
    dgSectionData.push(BUILD_SECTION.webBasedProducts());
    dgSectionData.push(BUILD_SECTION.operatingSystems());
    dgSectionData.push(BUILD_SECTION.desktopApps());
    dgSectionData.push(BUILD_SECTION.mobileApps());
    dgSectionData.push(BUILD_SECTION.hardware());
    dgSectionData.push(BUILD_SECTION.useful());
    dgSectionData.push(BUILD_SECTION.resources());
    dgSectionData.push(BUILD_SECTION.books());
    dgSectionData.push(BUILD_SECTION.blogs());
    dgSectionData.push(BUILD_SECTION.news());
    dgSectionData.push(BUILD_SECTION.lighterSide());
    dgSectionData.push(BUILD_SECTION.closingRemarks());

    // Write to the README file
    fs.writeFileSync(path.join(__dirname, 'README.md'), dgSectionData.join(`${os.EOL}${os.EOL}`));

    console.log('Done!');
}

/**
 * Synchronously reads a file using fs-extra and path.join()
 * @param {String} filename The file to read
 */
function readFile(filename) {
    return fs.readFileSync(path.join(__dirname, filename)).toString();
}

/**
 * Reads degoogle.yml
 */
function readYaml() {
    return YAML.parse(fs.readFileSync(path.join(__dirname, 'yaml/degoogle.yml')).toString());
}

/**
 * Generates a major section or "category" such as Mobile Apps
 * @param {String} header Title for section
 * @param {Object} data Object of data to populate README.md with
 */
function generateCategorySection(header, data) {
    if (!data) return '';

    // Set the header to HTML <h5>
    let categorySection = `## ${header}${os.EOL}${BACK_TO_TOP}${os.EOL}${os.EOL}`;

    // Generate service sections for this category
    Object.keys(data).forEach((key) => categorySection = categorySection.concat(`${generateServiceSection(data[key])}${os.EOL}${os.EOL}`));

    return categorySection;
}

/**
 * Generates a service (such as Gmail) section to be placed under a category section
 * @param {Array} data
 */
function generateServiceSection(data) {
    // Start the section with an <h4> header
    let serviceSection = `#### ${data[0].title + os.EOL + os.EOL}`;

    // Prep section notes
    let notes = os.EOL + '';

    // If there is data to be displayed, add the start of a Markdown table
    let tableHeader = `| Name | Eyes | Description |${os.EOL}| ---- | ---- | ----------- |${os.EOL}`;
    if (data.filter((d) => 'name' in d).length === 0) tableHeader = `No known alternatives.${os.EOL}`;

    // Add the header to the section body
    serviceSection = serviceSection.concat(tableHeader);

    // Iterate over each alternative service and add it to the table
    data.forEach((item) => {

        // If the object has length one, it's either title or note
        if (Object.keys(item).length == 1) {
            if (!item.notes) return;
            else item.notes.forEach((note) => notes = notes.concat(`- *${note.trim()}*${os.EOL}`));
        } else {

            // Build the cells for the table
            let name = `[${item.name}](${item.url})`;
            let eyes = item.eyes ? `**${item.eyes}-eyes**` : '';
            let text = item.text.trim();

            // Append the F-Droid badge to the name
            if (item.fdroid) name = name.concat('<br/>', fdroidLink(item.fdroid));

            // Append the Repo badge to the name
            if (item.repo) name = name.concat('<br/>', repoLink(item.repo));

            // Build the row
            let tableItem = `| ${name} | ${eyes} | ${text} |${os.EOL}`;

            // Add the row to the table
            serviceSection = serviceSection.concat(tableItem);
        }
    });
    return `${serviceSection}${notes}`;
}

/**
 * Returns a badge acting as a link to an F-Droid page for an app.
 * @param {String} appId The package identifier on F-Droid
 */
function fdroidLink(appId) {
    return `[![F-Droid](https://img.shields.io/f-droid/v/${appId}?style=flat-square&logo=f-droid)](https://f-droid.org/en/packages/${appId}/)`;
}

/**
 * Returns a badge acting as a link to a source repository for an app.
 * @param {String} repo The repository url
 */
function repoLink(repo) {
    let repoURL = new URL(repo);
    let repoHost = path.basename(repoURL.hostname, path.extname(repoURL.hostname));
    if (repoHost.includes(".")) repoHost = path.extname(repoHost).replace(".", "");
    return `[![Repo](https://img.shields.io/badge/open-source-3DA639?style=flat-square&logo=${repoHost})](${repo})`;
}

/**
 * Returns a badge displaying user for a Firefox addon/extension
 * @param {String} link URL to extension WITHOUT trailing slash
 */
function addonLink(link) {
    if (!link.includes('addons.mozilla.org')) return '';
    let addonId = link.split('/')[link.split('/').length - 1];
    return `![Mozilla Add-on](https://img.shields.io/amo/users/${addonId}?style=flat-square)`;
}

/**
 * Returns a badge with the date of publication
 * @param {String|Number} date Date of publication
 */
function dateBadge(date) {
    return `![Published](https://img.shields.io/badge/${date.toString().replace(/\-/g, '--')}-informational?style=flat-square)`;
}

/**
 * Generates a table with browser extensions and their descriptions
 */
function generateBrowserExtensions() {
    let extensions = `# Tarayıcı eklentileri${os.EOL + os.EOL}| Ad | Açıklama |${os.EOL}| ---- | ----------- |${os.EOL}`;
    let data = YAML.parse(fs.readFileSync(path.join(__dirname, 'yaml/browserExtensions.yml')).toString());
    data.forEach((item) => {
        let name = `[${item.name}](${item.url})`;
        let text = item.text.trim();
        let badge = addonLink(item.url);
        let tableItem = `| ${name + ' ' + badge} | ${text} |${os.EOL}`;
        extensions = extensions.concat(tableItem);
    });
    return extensions;
}

/**
 * Generates sections for Books, Blogs, and News
 * @param {String} title 
 * @param {String} filename 
 */
function generatePublications(title, filename) {
    let publications = `## ${title} ${os.EOL + BACK_TO_TOP + os.EOL + os.EOL}| Başlık | Yayınlandığı yıl | Yazar |${os.EOL}| ----- | --------- | ------ |${os.EOL}`;
    let data = YAML.parse(fs.readFileSync(path.join(__dirname, `yaml/${filename}.yml`)).toString());
    data.forEach((item) => {
        let name = `[${item.title}](${item.url})`;
        let author = item.author.trim();
        let tableItem = `| ${name} | ${dateBadge(item.date)} | ${author} |${os.EOL}`;
        publications = publications.concat(tableItem);
    });
    return publications;
}

__main__();
