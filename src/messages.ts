function StartMessages(
  canvasId: string,
  titleWeb: string = "Title Page",
): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas with id '${canvasId}' not found`);
    return;
  }

  // Create a new text element (e.g., a paragraph)
  let message: string = titleWeb;
  const titleElement = document.createElement("h1");
  titleElement.textContent = message;

  //Insert the text element before the canvas
  document.body.insertBefore(titleElement, canvas);

  // Create the nav element
  const navBar = document.createElement("nav");

  // Create a container div (optional, for styling)
  const navContainer = document.createElement("div");
  navContainer.classList.add("nav-container");

  // Create a logo or brand name
  const logo = document.createElement("a");
  logo.href = "#";
  logo.textContent = "Voxxer"; // Replace with your brand name
  logo.classList.add("logo");

  // Create an unordered list for the navigation links
  const navList = document.createElement("ul");
  navList.classList.add("nav-list");

  // Create navigation links as list items
  const navItems = [
    {
      text: "Github.com/j-2k/VoxxerWebGL",
      href: "https://github.com/j-2k/VoxxerWebGL",
    },

    { text: "Home", href: "#home" } /*
        { text: "About", href: "#about" },
        { text: "Services", href: "#services" },
        { text: "Contact", href: "#contact" }*/,
  ];

  if (navItems.length > 0) {
    //First time initalization
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = navItems[0].href;
    //link.textContent = navItems[0].text;
    link.classList.add("nav-link");
    const gitRepoImg = document.createElement("img");
    gitRepoImg.src = "/githublogo.png";
    link.appendChild(gitRepoImg);
    navList.appendChild(link);

    // Loop through remaning navItems to create and append each link
    navItems.slice(1).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.classList.add("nav-item");

      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.text;
      link.classList.add("nav-link");

      listItem.appendChild(link);
      navList.appendChild(listItem);
    });
  }

  // Append logo and navList to the container
  navContainer.appendChild(logo);
  navContainer.appendChild(navList);

  // Append the container to the navBar
  navBar.appendChild(navContainer);

  // Finally, append the navBar to the body (or any other element you want)
  document.body.insertBefore(navBar, titleElement);

  const bodyMessages = [
    "This is mainly a learning project, I hope you enjoy it!",
  ];

  bodyMessages.forEach((msg) => {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = msg;
    document.body.appendChild(paragraphElement);
  });
  return;
}

export { StartMessages };
