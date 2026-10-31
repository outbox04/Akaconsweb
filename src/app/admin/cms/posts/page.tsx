import { CmsNavigation } from '@/components/cms-navigation';
import { CmsPostsManager } from '@/components/cms-posts-manager';

export default function CmsPostsPage() {
  return <main className="cms-page"><header className="cms-header"><div><p>CMS · BÀI VIẾT</p><h1>Quản lý bài viết</h1><span>Tạo bản nháp, biên tập, duyệt và xuất bản nội dung AKACONS.</span></div></header><CmsNavigation /><CmsPostsManager /></main>;
}
