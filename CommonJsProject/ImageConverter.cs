using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonJsProject
{
    public class ImageConverter
    {
        public static void GenerateThumbnail(string sourceFlie, string destinationFile, int width, int height, ThumbnailMode mode)
        {
            using (Image sourceImage = Image.FromFile(sourceFlie))
            {
                switch (mode)
                {
                    case ThumbnailMode.WH:
                        break;
                    case ThumbnailMode.W:
                        height = sourceImage.Height * width / sourceImage.Width;
                        break;
                    case ThumbnailMode.H:
                        width = sourceImage.Width * height / sourceImage.Height;
                        break;
                }
                if (width > sourceImage.Width) width = sourceImage.Width;
                if (height > sourceImage.Height) height = sourceImage.Height;
                using (Bitmap bmp = new Bitmap(width, height))  //新建一个图片
                {
                    using (Graphics g = Graphics.FromImage(bmp)) //画板
                    {
                        g.InterpolationMode = InterpolationMode.High;
                        g.SmoothingMode = SmoothingMode.HighQuality;
                        g.Clear(Color.Transparent);
                        g.DrawImage(sourceImage, new Rectangle(0, 0, width, height), new Rectangle(0, 0, sourceImage.Width, sourceImage.Height), GraphicsUnit.Pixel);
                    }
                    bmp.Save(destinationFile);
                }
            }
        }
        public static void CutImage(string sourceFlie, string destinationFile, int sourceX, int sourceY, int width, int height)
        {
            using (Image sourceImage = Image.FromFile(sourceFlie))
            {
                using (Bitmap bmp = new Bitmap(width, height)) //新建一个图片
                {
                    using (Graphics g = Graphics.FromImage(bmp))//画板
                    {
                        g.InterpolationMode = InterpolationMode.High;
                        g.SmoothingMode = SmoothingMode.HighQuality;
                        g.Clear(Color.Transparent);
                        g.DrawImage(sourceImage, new Rectangle(0, 0, width, height), new Rectangle(sourceX, sourceY, width, height), GraphicsUnit.Pixel);
                    }
                    bmp.Save(destinationFile);
                }
            }
        }
    }
    public enum ThumbnailMode
    {
        //指定宽高，可能变形
        WH = 1,
        //指定宽，高按比例
        W = 2,
        //指定高，宽按比率
        H = 3
    }
}
