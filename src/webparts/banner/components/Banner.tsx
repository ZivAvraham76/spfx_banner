import * as React from 'react';
import '../../../../assets/dist/tailwind.css';
import type { IBannerProps } from './IBannerProps';

interface IListItem {
  Id: number;
  Title: string;
  banner_text: string;
  Attachments: boolean;
  AttachmentFiles: { ServerRelativeUrl: string }[];
  Active: boolean;
}

const Banner: React.FC<IBannerProps> = (props) => {
  const { siteName, listName, duration } = props;
  const [listItems, setListItems] = React.useState<IListItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  // Filtration for active items
  const activeItems = listItems.filter(item => item.Active);

  // fetch the list and its attachments
  React.useEffect(() => {
    const fetchListData = async (): Promise<void> => {
      const currSite = `https://mosh12.sharepoint.com/sites/${siteName}`;
      const currList = listName;
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
          const updatedItems = await Promise.all(data.value.map(async (item: IListItem) => {
            let attachmentFiles = item.AttachmentFiles || [];
            if (item.Attachments) {
              const attachmentResponse = await fetch(`${currSite}/_api/web/lists/getbytitle('${currList}')/items(${item.Id})/AttachmentFiles`, {
                method: "GET",
                headers: {
                  "Accept": "application/json;odata=nometadata"
                }
              });
              const attachmentData = await attachmentResponse.json();
              if (attachmentData.value && attachmentData.value.length > 0) {
                attachmentFiles = attachmentData.value;
              }
            }
            return{
              ...item,
              AttachmentFiles: attachmentFiles
            }
          }));
          setListItems(updatedItems);
        }
      } catch (error) {
        console.error("Error fetching list data:", error);
      }
    };

    // eslint-disable-next-line no-void
    void fetchListData();
  }, [siteName, listName, duration]);

  // next image every x minutes
  React.useEffect(() => {
    if (activeItems.length === 0) return;

    // If there's only one active item, no need for the interval logic
    if (activeItems.length === 1) {
      setCurrentIndex(0); // Display the single active item
      return;
    }

    // If there are multiple active items, we proceed with the usual logic for changing the image
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeItems.length); 
    }, 1000 * duration);

    return () => clearInterval(interval); 
  }, [listItems, duration]);

  return (
      <div className="relative flex-shrink-0 overflow-hidden w-[1217px] h-[291px] mx-auto flex justify-center items-center p-8">
        {activeItems.length > 0 && (
          <>
            {/* Display the active items only */}
            {activeItems[currentIndex].Active && activeItems[currentIndex].AttachmentFiles?.length > 0 && (
              <img
                className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ease-in-out"
                src={`https://mosh12.sharepoint.com${activeItems[currentIndex].AttachmentFiles[0].ServerRelativeUrl}`}
                alt="Banner"
              />
            )}
            <p className="absolute inset-0 z-20 flex items-center text-center justify-center text-[#41273c] text-3xl font-bold">
              {activeItems[currentIndex].banner_text}
            </p>
            {activeItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                {activeItems.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full bg-[#41273c] transition-all ${
                      index === currentIndex ? 'bg-[#41273c]' : 'bg-[#41273c] opacity-50'
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
