'use client';

// Smooth scroll button for Browse Reports CTA

export function BrowseReportsButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const sectorsElement = document.getElementById('sectors');
    if (sectorsElement) {
      sectorsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="inline-block px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition shadow-lg"
    >
      Browse Reports
    </button>
  );
}

