export default function Title({title, subTitle, align, font}) {
    return(
        <div className={`flex flex-col justify-center text-center items-center ${align === "left" && "md:items-start md:text-left"}`}>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-[40px] ${font || "playfair-font"}`}>{title}</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500/90 mt-1 sm:mt-2 max-w-full sm:max-w-174 px-2 sm:px-0">{subTitle}</p>
        </div>
    )
}