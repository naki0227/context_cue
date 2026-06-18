pub fn shorten_list(items: &[String], max_items: usize) -> Vec<String> {
    items.iter().take(max_items).cloned().collect()
}
