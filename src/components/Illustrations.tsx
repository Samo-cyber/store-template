export function HeroIllustration() {
    return (
        <svg
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
        >
            <circle cx="250" cy="250" r="200" fill="currentColor" className="text-muted/20" />
            <rect
                x="150"
                y="150"
                width="200"
                height="200"
                rx="40"
                fill="currentColor"
                className="text-primary/10"
            />
            <path
                d="M170 150V130C170 85.8172 205.817 50 250 50C294.183 50 330 85.8172 330 130V150"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinecap="round"
                className="text-primary"
            />
            <path
                d="M150 190H350V350C350 372.091 332.091 390 310 390H190C167.909 390 150 372.091 150 350V190Z"
                fill="currentColor"
                className="text-primary"
            />
            <circle cx="250" cy="250" r="30" fill="currentColor" className="text-background" />
        </svg>
    );
}

export function ProductPlaceholder() {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
        >
            <rect width="200" height="200" fill="currentColor" className="text-muted/30" />
            <path
                d="M60 140L90 100L110 120L140 80L180 140H60Z"
                fill="currentColor"
                className="text-muted-foreground/20"
            />
            <circle cx="140" cy="60" r="15" fill="currentColor" className="text-muted-foreground/20" />
        </svg>
    );
}
