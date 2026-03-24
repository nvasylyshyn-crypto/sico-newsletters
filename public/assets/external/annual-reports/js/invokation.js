$('#menu').load('menu/menu.html',mmenuInoke);

function mmenuInoke() {
    const mainMenu = $('.main-menu');
	const mainMenuContent = $('.main-menu > ul');
	const mainMenuItems = mainMenuContent.children('li:not(.top-menu-item)');
	const hamburger = document.querySelector('.hamburger');

	// Define sub menu items
	mainMenuContent.find('li').has('ul').addClass('has-sub-menu');

	// Define the last visiable item
	mainMenuItems.last().addClass('menu-edge');

	// Initialize mmenu
	const MainMenuInit = mainMenu.mmenu({
		extensions: [
			"position-right"
		]
	}, {
			// configuration
			clone: true,
			offCanvas: {
				pageSelector: '.page'
			},
			classNames: {
				fixedElements: {
					fixed: 'mm-slideout'
				}
			}
		});

	const mainMenuAPI = $(MainMenuInit).data('mmenu');

	// On click
	hamburger.addEventListener('click', () => {
		if (hamburger.classList.contains('is-active')) {
			mainMenuAPI.close()
		} else {
			mainMenuAPI.open()
		}
	});

	mainMenuAPI.bind('open:finish', () => {
		setTimeout(function () {
			hamburger.classList.add("is-active");
		}, 100);
	});

	mainMenuAPI.bind('close:finish', () => {
		setTimeout(function () {
			hamburger.classList.remove("is-active");
		}, 100);
	});
};
