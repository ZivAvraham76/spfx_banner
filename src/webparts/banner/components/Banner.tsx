import * as React from 'react';
import '../../../../assets/dist/tailwind.css';
import type { IBannerProps } from './IBannerProps';

interface IListItem {
  Id: number;
  Title: string;
  banner_text: string;
}

const Banner: React.FC<IBannerProps> = (props) => {
  const {siteName, listName, duration} = props;
  const [listItems, setListItems] = React.useState<IListItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // fetch the list
  React.useEffect(() => {
    const fetchListData = async () => {
      const currSite = `https://mosh12.sharepoint.com/sites/${siteName}`;
      const currList = listName
      try {
        const response = await fetch(`${currSite}/_api/web/lists/getbytitle('${currList}')/items`, {
          method: "GET",
          headers: {
            "Accept": "application/json;odata=nometadata"
          }
        });

        const data = await response.json();
        console.log("dataList:", data);

        if (data.value) {
          setListItems(data.value);
        }
      } catch (error) {
        console.error("Error fetching list data:", error);
      }
    };

    fetchListData();
  }, [siteName, listName,duration]);

  // next image every x minutes
  React.useEffect(() => {
    if (listItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % listItems.length); 
    }, 1000*duration); 

    

    return () => clearInterval(interval); 
  }, [listItems]);
  return (
    <div className="relative w-full h-[121px] flex-shrink-0 overflow-hidden">
      {listItems.length > 0 && (
        <>
          <img className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" src={listItems[currentIndex].Title} />
          <p className="absolute inset-0 flex items-center text-center justify-center text-white text-3xl font-bold">
            {listItems[currentIndex].banner_text}
          </p>
          {listItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {listItems.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full bg-white transition-all ${
                    index === currentIndex ? 'bg-white' : 'opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
          

        </>
      )}
    </div>
  );
};

export default Banner;
