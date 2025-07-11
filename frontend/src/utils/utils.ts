export const getRandomColor = (): string =>  {
  const colors: string[] = [
    "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#1ABC9C", "#E67E22", "#2ECC71", "#3498DB", "#E74C3C",
    "#34495E", "#16A085", "#27AE60", "#2980B9", "#8E44AD", "#2C3E50", "#F39C12", "#D35400", "#C0392B", "#BDC3C7",
    "#7F8C8D", "#95A5A6", "#ECF0F1", "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1", "#955251", "#B565A7",
    "#009B77", "#DD4124", "#45B8AC", "#EFC050", "#5B5EA6", "#9B2335", "#DFCFBE", "#55B4B0", "#E15D44", "#7FCDCD",
    "#BC243C", "#C3447A", "#98B4D4", "#D65076", "#6C4F3D", "#4B5335", "#FFB400", "#FF7F50", "#FFD700", "#ADFF2F",
    "#20B2AA", "#9370DB", "#FF69B4", "#DC143C", "#7FFF00", "#00CED1", "#00FA9A", "#8A2BE2", "#FF4500", "#DAA520",
    "#40E0D0", "#BA55D3", "#FF1493", "#7CFC00", "#4682B4", "#FF6347", "#D2691E", "#AFEEEE", "#00FF7F", "#DB7093",
    "#CD5C5C", "#00BFFF", "#FA8072", "#90EE90", "#3CB371", "#B0C4DE", "#FFA07A", "#FF8C00", "#F08080", "#8B0000",
    "#F0E68C", "#8FBC8F", "#B22222", "#6A5ACD", "#F5DEB3", "#708090", "#483D8B", "#BC8F8F", "#A0522D", "#CD853F",
    "#A9A9A9", "#778899", "#2F4F4F", "#ADD8E6", "#800000", "#BDB76B", "#66CDAA", "#D2B48C", "#FFDEAD", "#DA70D6",
    "#D8BFD8", "#FFE4E1", "#FFEBCD", "#FFFAF0", "#F5F5F5"
  ];

  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}
