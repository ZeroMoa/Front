export interface AdminProductCategoryNode {
    id: number;
    name: string;
}

export interface AdminProductCategoryGroup {
    parent: AdminProductCategoryNode;
    children: AdminProductCategoryNode[];
}

