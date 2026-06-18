document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5800);
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";

  filterRoots.forEach(function (root) {
    var input = root.querySelector("[data-filter-input]");
    var year = root.querySelector("[data-filter-year]");
    var region = root.querySelector("[data-filter-region]");
    var type = root.querySelector("[data-filter-type]");
    var items = Array.prototype.slice.call(root.querySelectorAll(".movie-item"));

    if (input && q) {
      input.value = q;
    }

    function currentValue(control) {
      return control ? control.value.trim().toLowerCase() : "";
    }

    function filterItems() {
      var keyword = currentValue(input);
      var selectedYear = currentValue(year);
      var selectedRegion = currentValue(region);
      var selectedType = currentValue(type);

      items.forEach(function (item) {
        var text = [
          item.dataset.title || "",
          item.dataset.genre || "",
          item.dataset.tags || "",
          item.dataset.region || "",
          item.dataset.type || "",
          item.dataset.year || ""
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || (item.dataset.year || "").toLowerCase() === selectedYear;
        var matchRegion = !selectedRegion || (item.dataset.region || "").toLowerCase().indexOf(selectedRegion) !== -1;
        var matchType = !selectedType || (item.dataset.type || "").toLowerCase().indexOf(selectedType) !== -1;
        item.classList.toggle("is-filtered", !(matchKeyword && matchYear && matchRegion && matchType));
      });
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterItems);
        control.addEventListener("change", filterItems);
      }
    });

    filterItems();
  });
});
